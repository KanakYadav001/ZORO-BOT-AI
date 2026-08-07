const express = require('express');

const AuthMiddleware = require('../middleware/auth.middleware');
const ChatController = require('../controller/chat.controller'); 
const router = express.Router();

router.post('/create', AuthMiddleware, ChatController.createChat);
router.get('/get', AuthMiddleware, ChatController.getChats);
router.delete('/delete/:chatId', AuthMiddleware, ChatController.deleteChat);
router.get('/messages/:chatId', AuthMiddleware, ChatController.getMessages);

module.exports = router;    