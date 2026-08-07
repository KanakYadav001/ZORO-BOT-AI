const express = require('express');
const router = express.Router();
const userController = require("../controller/user.controller");
const AuthMiddleware = require('../middleware/auth.middleware');

router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/logout', userController.logout);
router.get('/me', AuthMiddleware, userController.getProfile);

module.exports = router;