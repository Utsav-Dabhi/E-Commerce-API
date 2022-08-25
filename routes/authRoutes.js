const express = require('express');
const router = express.Router();

const { register, login, logout } = require('../controllers/authController');

/* There are 2 flavours of setting the routers */

// 1.
// router.route('/register').post(register);

// 2.
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
