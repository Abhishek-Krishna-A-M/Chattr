const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

// Make io available globally or pass it properly
let io;

const setIO = (socketIO) => {
    io = socketIO;
};

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

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId, media, mediaType } = req.body;

    if ((!content && !media) || !chatId) {
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        media: media,
        mediaType: mediaType,
        status: 'sent'
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate('sender', 'name pic');
        message = await message.populate('chat');
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name pic email',
        });

        await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

        // Emit to all users in the chat
        if (io) {
            io.to(chatId).emit('message received', message);

            // Also emit to individual user rooms for notifications
            const chat = await Chat.findById(chatId).populate('users', '-password');
            if (chat && chat.users) {
                chat.users.forEach(user => {
                    if (user._id.toString() !== req.user._id.toString()) {
                        io.to(user._id.toString()).emit('new message notification', message);
                    }
                });
            }
        }

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// Mark messages as read
const markAsRead = asyncHandler(async (req, res) => {
    const { messageIds } = req.body;

    try {
        await Message.updateMany(
            { _id: { $in: messageIds } },
            { $addToSet: { readBy: req.user._id } }
        );

        if (io) {
            // Notify other users that messages were read
            io.emit('messages read', { messageIds, readBy: req.user._id });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { allMessages, sendMessage, markAsRead, setIO };
