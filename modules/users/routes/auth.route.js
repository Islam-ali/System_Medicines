const express = require('express');
const authService = require('../services/auth.service');
const validator = require('../validation/auth.validation');
const router = express.Router();


router.post('/register' ,validator.validateRegistration , validator.validatePassword , authService.register)

router.post('/login' ,validator.validateLogin, authService.login)

router.get('/getUserById/:id' , authService.getUserById);

router.get('/getAllUsers' , authService.getAllUsers);

router.put('/updateUser/:id', validator.validateRegistration , authService.updateUser);

router.put("/changeStatus/:id", authService.changeStatus);

module.exports = router;
