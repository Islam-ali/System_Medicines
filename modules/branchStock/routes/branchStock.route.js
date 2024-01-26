const express = require('express');
const router = express.Router();
const branchStockService = require('../services/branchStock.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');

// Get all factories
router.get(
  "/getbranchStock",
  verifyToken,
  // checkPermission("branchStock.read"),
  branchStockService.getbranchStock
);

router.get(
  "/getAllBranchStock",
  verifyToken,
  // checkPermission("branchStock.read"),
  branchStockService.getAllBranchStock
);
module.exports = router;