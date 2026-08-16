const socketIo = require("socket.io");
const { getGroqChatCompletion } = require("../service/ai.service");
const messageModel = require("../models/messages.model");
const chatModel = require("../models/chat.model");
const jwt = require("jsonwebtoken");
const { CreateEmbedding } = require("../service/ai.service");
const { searchWebContext } = require("../service/tavily.service");
const {
  uploadToPinecone,
  getContextFromPinecone,
} = require("../service/pinecone.service");

const WEB_SEARCH_TIMEOUT_MS = 5000;

function shouldUseWebSearch(text = "") {
  const query = text.toLowerCase();
  const webKeywords = [
    "today",
    "latest",
    "news",
    "current",
    "price",
    "stock",
    "weather",
    "score",
    "match",
    "update",
    "2026",
  ];

  return webKeywords.some((keyword) => query.includes(keyword));
}

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => resolve(fallback), ms);
    }),
  ]);
}

function setupSocketServer(server) {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
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
        if (!msg?.chatId || !msg?.data?.trim()) {
          return socket.emit("response", "Please send a valid message.");
        }

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

        // Start independent tasks in parallel to reduce end-to-end latency.
        const userMessagePromise = messageModel.create({
          userId: socket.user,
          chatId: msg.chatId,
          content: msg.data,
          role: "user",
        });

        // Fetch recent sequential conversation history from MongoDB (Chronological order)
        const recentHistoryPromise = messageModel
          .find({ userId: socket.user, chatId: msg.chatId })
          .sort({ createdAt: -1 })
          .limit(8)
          .lean()
          .then((docs) => docs.reverse());

        const userMessageEmbeddingPromise = CreateEmbedding(msg.data);
        const webContextPromise = shouldUseWebSearch(msg.data)
          ? withTimeout(
              searchWebContext(msg.data, 3),
              WEB_SEARCH_TIMEOUT_MS,
              [],
            )
          : Promise.resolve([]);

        // Build Pinecone semantic RAG context as soon as embedding is ready.
        const previousContextPromise = userMessageEmbeddingPromise.then(
          (embedding) =>
            embedding
              ? getContextFromPinecone(embedding, socket.user, msg.chatId, 5)
              : [],
        );

        // Upload user vector in background as soon as message+embedding are both available.
        Promise.all([userMessagePromise, userMessageEmbeddingPromise])
          .then(([userMessage, userMessageEmbedding]) => {
            if (!userMessageEmbedding) return null;
            return uploadToPinecone(userMessage.id, userMessageEmbedding, {
              userId: socket.user,
              chatId: msg.chatId,
              role: "user",
              content: msg.data,
            });
          })
          .catch((error) => {
            console.error("Background user vector upload failed:", error);
          });

        // Wait only for data required to generate the model response.
        const [recentHistory, semanticContextRaw, webContext] =
          await Promise.all([
            recentHistoryPromise,
            previousContextPromise,
            webContextPromise,
          ]);

        // Deduplicate Pinecone memory hits against recent history to avoid redundant context
        const recentContentSet = new Set(
          (recentHistory || []).map((m) => m.content?.trim().toLowerCase()),
        );

        const semanticContext = (semanticContextRaw || []).filter((item) => {
          const content = (item.metadata?.content || "").trim().toLowerCase();
          return content && !recentContentSet.has(content);
        });

        if (shouldUseWebSearch(msg.data)) {
          console.log(
            `Web search context items: ${webContext.length} for query: ${msg.data}`,
          );
        }

        // Get response from Groq using Dual-Layer Context (Recent dialog + RAG Memory + Web)
        const response = await getGroqChatCompletion(
          msg.data,
          recentHistory,
          semanticContext,
          webContext,
        );

        // Respond to client immediately after model output is ready.
        socket.emit("response", response);

        // Persist assistant message + vector in background to keep response path fast.
        const assistantMessagePromise = messageModel.create({
          userId: socket.user,
          chatId: msg.chatId,
          content: response,
          role: "assistant",
        });

        const assistantEmbeddingPromise = CreateEmbedding(response);

        Promise.all([assistantMessagePromise, assistantEmbeddingPromise])
          .then(([assistantMessage, assistantEmbedding]) => {
            if (!assistantEmbedding) return null;
            return uploadToPinecone(assistantMessage.id, assistantEmbedding, {
              userId: socket.user,
              chatId: msg.chatId,
              role: "assistant",
              content: response,
            });
          })
          .catch((error) => {
            console.error("Background assistant persistence failed:", error);
          });

        console.log("Received message:", response);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        socket.emit("response", "Sorry, I encountered an error.");
      }
    });
  });
}

module.exports = setupSocketServer;
