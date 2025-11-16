const express = require('express');
const router = express.Router();
const {handleUser} = require('./controllers');

router.get('/user', handleUser);

module.exports = router;