const express = require('express');
const router = express.Router();
const stockService = require('../services/stock.service');
const {verifyToken,checkUserRole} = require('../../../middelware/auth.middleware');

// Get all factories
router.get(
  "/getStock",
  verifyToken,
  checkUserRole("admin"),
  stockService.getStock
);

module.exports = router;