const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get or Search all users
// @route   GET /api/users?search=
// @access  Private (requires token)
const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } }, // Case-insensitive search on name
                { email: { $regex: req.query.search, $options: 'i' } }, // Case-insensitive search on email
            ],
        }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
});

module.exports = { allUsers };
