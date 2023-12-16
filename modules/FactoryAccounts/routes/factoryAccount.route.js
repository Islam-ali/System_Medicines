const express = require('express');
const router = express.Router();
const factoryAccountService = require('../services/factoryAccount.service');
const {verifyToken,checkUserRole} = require('../../../middelware/auth.middleware');


// Get all factories
router.get('/getFactoryAccountLog', verifyToken , checkUserRole('admin') ,factoryAccountService.getFactoryAccountLog);

module.exports = router;