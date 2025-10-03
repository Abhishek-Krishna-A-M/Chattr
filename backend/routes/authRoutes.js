const express = require('express');
const { registerUser, authUser } = require('../controllers/authController');
const loginLimiter = require('../middleware/loginLimiter')
const router = express.Router();

router.route('/register').post(registerUser);
router.post('/login', loginLimiter, authUser);

module.exports = router;
