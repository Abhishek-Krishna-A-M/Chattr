const express = require('express');
const {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, accessChat); // Create or access 1-on-1 chat
router.route('/').get(protect, fetchChats); // Fetch all chats for a user
router.route('/group').post(protect, createGroupChat); // Create group chat
router.route('/group/rename').put(protect, renameGroup); // Rename group chat
router.route('/group/add').put(protect, addToGroup); // Add user to group
router.route('/group/remove').put(protect, removeFromGroup); // Remove user from group

module.exports = router;
