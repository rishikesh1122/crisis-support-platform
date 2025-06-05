const express = require('express');

const { register, login, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware'); // <-- Use the correct middleware

const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe); // ✅ Protect this route

module.exports = router;
