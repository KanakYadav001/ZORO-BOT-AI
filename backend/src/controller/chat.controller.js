const chatModel = require("../models/chat.model");
const messageModel = require("../models/messages.model");
const mongoose = require("mongoose");

async function createChat(req, res) {
  try {
    const userId = req.user.id;
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Chat title is required" });
    }

    const newChat = await chatModel.create({
      userId: userId,
      title,
    });

    res.status(201).json({
      message: "Chat created successfully",
      chat: newChat,
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getChats(req, res) {
  try {
    const userId = req.user.id;
    const chats = await chatModel.find({ userId: userId }).sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteChat(req, res) {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    const chat = await chatModel.findOne({ _id: chatId, userId: userId });
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    await chatModel.deleteOne({ _id: chatId, userId: userId });
    await messageModel.deleteMany({ chatId, userId });

    res.status(200).json({ message: "Chat deleted successfully", chat });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getMessages(req, res) {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    const messages = await messageModel.find({ chatId, userId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createChat,
  getChats,
  deleteChat,
  getMessages,
};
