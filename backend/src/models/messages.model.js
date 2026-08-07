const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
    },

    role: {
        type: String,
        enum: ['user', 'assistant', 'model'],
        default: 'user',
    },



}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);


module.exports = Message;