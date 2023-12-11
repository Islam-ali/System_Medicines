const express = require('express');
const authService = require('../services/auth.service');
const validator = require('../validation/auth.validation');
const router = express.Router();


router.post('/register' ,validator.validateRegistration, authService.register)

router.post('/login' ,validator.validateLogin, authService.login)


module.exports = router;
