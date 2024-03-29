const express = require('express');
const router = express.Router();
const branchStockService = require('../services/branchStock.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');

// Get all factories
router.get(
  "/getbranchStock",
  verifyToken,
  checkPermission("branchStock.read"),
  branchStockService.getbranchStock
);

router.get(
  "/getAllBranchStock",
  verifyToken,
  checkPermission("branchStock.read"),
  branchStockService.getAllBranchStock
);

router.put(
  "/changeStatusBranchStock/:id",
  verifyToken,
  checkPermission("branchStock.read"),
  branchStockService.changeStatusBranchStock
);

router.put(
  "/updateBranch",
  // verifyToken,
  // checkPermission("branchStock.read"),
  branchStockService.updateBranch
);
module.exports = router;