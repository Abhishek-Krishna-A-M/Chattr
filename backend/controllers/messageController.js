const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

// @desc    Get all messages for a specific chat
// @route   GET /api/messages/:chatId
// @access  Private
const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', 'name pic email')
            .populate('chat');
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId, media, mediaType } = req.body;

    if (!content && !media || !chatId) {
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        media: media,
        mediaType: mediaType
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate('sender', 'name pic');
        message = await message.populate('chat');
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name pic email',
        });

        // Update the latestMessage field in the Chat model
        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        const chat = await Chat.findById(chatId).populate('users', '-password');
        if (chat && chat.users) {
            chat.users.forEach(user => {
                if (user._id.toString() === req.user._id.toString()) return; // Don't send to self
                // Emit to the individual user's room for notification
                io.to(user._id.toString()).emit('message received', message);
            });
            // Optionally, emit to the chat room for direct display if user is in chat
            // io.to(chatId).emit('message displayed', message); // This might be redundant if individual rooms handle it
        }

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { allMessages, sendMessage };
