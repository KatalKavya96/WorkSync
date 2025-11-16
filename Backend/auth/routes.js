const express = require('express');
const router = express.Router();
const {handleLogin, handleSignup, handleRefresh} = require('./controllers');

router.post('/login', handleLogin);
router.post('/signup', handleSignup);
router.post('/refresh', handleRefresh)

module.exports = router;