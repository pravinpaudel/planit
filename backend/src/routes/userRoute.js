const express = require('express');
const router = express.Router();
const { handleLogin, handleRegister } = require('../controllers/userController');

router.post('/login', handleLogin);
router.post('/register', handleRegister);

module.exports = router;