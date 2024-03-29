const express = require('express');
const router = express.Router();
const factoryAccountService = require('../services/factoryAccount.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');


// Get all factories
router.get(
  "/getFactoryAccountLog",
  verifyToken,
  checkPermission("factory.read"),
  factoryAccountService.getFactoryAccountLog
);

module.exports = router;