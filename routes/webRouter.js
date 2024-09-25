const express = require('express');
const user_router = express.Router();

// user_router.get("view engine",'ejs');
// user_router.set('views','./views');
user_router.use(express.static('public'));
const { register, verifyMail } = require('../controller/userController');


user_router.get('/mail-verification', verifyMail)
module.exports = user_router;