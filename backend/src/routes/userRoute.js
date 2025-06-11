const express = require('express');
const router = express.Router();
const { 
    handleLogin, 
    handleRegister,
    handleRefreshToken,
    handleLogout
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', handleLogin);
router.post('/register', handleRegister);
router.post('/refresh-token', handleRefreshToken);
router.post('/logout', handleLogout);

module.exports = router;