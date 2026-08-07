const socketIo = require("socket.io");
const { getGroqChatCompletion } = require("../service/ai.service");
const messageModel = require("../models/messages.model");
const chatModel = require("../models/chat.model");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { request } = require("../app");
const { CreateEmbedding } = require("../service/ai.service");
const {
  uploadToPinecone,
  getContextFromPinecone,
} = require("../service/pinecone.service");

function setupSocketServer(server) {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Verify chatId belongs to the user
  async function verifyChatOwnership(userId, chatId) {
    try {
      const chat = await chatModel.findById(chatId);
      if (!chat) {
        return false;
      }
      // Ensure chat belongs to the user
      return chat.userId.toString() === userId.toString();
    } catch (error) {
      console.error("Error verifying chat ownership:", error);
      return false;
    }
  }

  io.use((socket, next) => {
    const token = socket.handshake.query.token;

    if (!token) {
      return next(new Error("Authentication error: Token is required"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded.id;
      next();
    } catch (error) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });

    socket.on("message", async (msg) => {
      try {
        // Security: Verify chatId belongs to the current user
        const isChatOwner = await verifyChatOwnership(socket.user, msg.chatId);
        if (!isChatOwner) {
          console.warn(
            `Unauthorized chat access attempt by user ${socket.user} for chat ${msg.chatId}`,
          );
          return socket.emit(
            "response",
            "Unauthorized: Chat does not belong to you",
          );
        }

        const UserMessage = await messageModel.create({
          userId: socket.user,
          chatId: msg.chatId,
          content: msg.data,
          role: "user",
        });

        // 1. Generate embedding for user message
        const userMessageEmbedding = await CreateEmbedding(msg.data);

        // 2. Retrieve previous context from Pinecone BEFORE uploading current message
        const previousContext = await getContextFromPinecone(
          userMessageEmbedding,
          socket.user,
          msg.chatId,
          5
        );

        // 3. Upload User Message vector to Pinecone
        if (userMessageEmbedding) {
          await uploadToPinecone(
            UserMessage.id,
            userMessageEmbedding,
            {
              userId: socket.user,
              chatId: msg.chatId,
              role: "user",
              content: msg.data,
            }
          );
        }

        // 4. Fetch user profile & Get response from Groq using context + User Profile
        const userProfile = await userModel.findById(socket.user).select("name email");
        const response = await getGroqChatCompletion(msg, previousContext, userProfile);

        socket.emit("response", response);

        // 5. Save Model response to MongoDB
        const ModelMessage = await messageModel.create({
          userId: socket.user,
          chatId: msg.chatId,
          content: response,
          role: "assistant",
        });

        // 6. Generate embedding & upload Model Message vector to Pinecone
        const modelMessageEmbedding = await CreateEmbedding(response);
        if (modelMessageEmbedding) {
          await uploadToPinecone(
            ModelMessage.id,
            modelMessageEmbedding,
            {
              userId: socket.user,
              chatId: msg.chatId,
              role: "assistant",
              content: response,
            }
          );
        }

        console.log("Received message:", response);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        socket.emit("response", "Sorry, I encountered an error.");
      }
    });
  });
}

module.exports = setupSocketServer;
