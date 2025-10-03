const asyncHandler = require('express-async-handler');
const Chat = require('../models/Chat');
const User = require('../models/User'); // Required to populate user data

// @desc    Access a one-on-one chat or create if it doesn't exist
// @route   POST /api/chats
// @access  Private
const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body; // The ID of the user to chat with

    if (!userId) {
        console.log('UserId param not sent with request');
        return res.sendStatus(400);
    }

    // Check if a chat already exists between the two users
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } }, // Current user
            { users: { $elemMatch: { $eq: userId } } }, // Other user
        ],
    })
        .populate('users', '-password') // Populate user details except password
        .populate('latestMessage'); // Populate latest message

    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: 'name pic email',
    });

    if (isChat.length > 0) {
        res.send(isChat[0]); // If chat exists, send it
    } else {
        // If chat does not exist, create a new one
        var chatData = {
            chatName: 'sender', // Will be dynamically set on frontend
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id })
                .populate('users', '-password');
            res.status(200).json(fullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

// @desc    Fetch all chats for a user
// @route   GET /api/chats
// @access  Private
const fetchChats = asyncHandler(async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            .populate('latestMessage')
            .sort({ updatedAt: -1 }) // Sort by latest updated chat
            .then(async (results) => {
                results = await User.populate(results, {
                    path: 'latestMessage.sender',
                    select: 'name pic email',
                });
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Create New Group Chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: 'Please Fill all the fields' });
    }

    var users = JSON.parse(req.body.users); // Users array sent as stringified JSON

    if (users.length < 2) {
        return res
            .status(400)
            .send('More than 2 users are required to form a group chat');
    }

    users.push(req.user); // Add the current user to the group

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Rename Group Chat
// @route   PUT /api/chats/group/rename
// @access  Private
const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName,
        },
        {
            new: true, // Return the updated document
        }
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    if (!updatedChat) {
        res.status(404);
        throw new Error('Chat Not Found');
    } else {
        res.json(updatedChat);
    }
});

// @desc    Add user to Group Chat
// @route   PUT /api/chats/group/add
// @access  Private
const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    // Check if the requester is admin (optional, but good for production)
    // For now, any member can add, but for security, only admin should.

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId }, // Add user to the users array
        },
        {
            new: true,
        }
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    if (!added) {
        res.status(404);
        throw new Error('Chat Not Found');
    } else {
        res.json(added);
    }
});

// @desc    Remove user from Group Chat
// @route   PUT /api/chats/group/remove
// @access  Private
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    // Check if the requester is admin (optional, but good for production)
    // For now, any member can remove, but for security, only admin should.

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId }, // Remove user from the users array
        },
        {
            new: true,
        }
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    if (!removed) {
        res.status(404);
        throw new Error('Chat Not Found');
    } else {
        res.json(removed);
    }
});


module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
};
