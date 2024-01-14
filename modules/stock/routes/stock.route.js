const express = require('express');
const router = express.Router();
const stockService = require('../services/stock.service');
const logTransactionStockService = require('../services/logTransactionStock.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');

// Get all factories
router.get(
  "/getStock/:classificationId",
  verifyToken,
  // checkPermission("stock.read"),
  stockService.getStock
);

router.put(
  "/updateInfoInStock/:id",
  verifyToken,
  // checkPermission("stock.update"),
  stockService.updateInfoInStock
);


router.put(
  "/transactionToBranchStock",
  verifyToken,
  // checkPermission("stock.update"),
  stockService.transactionToBranchStock
);

// Get all Log Transaction Stock
router.get(
  "/getLogTransactionStock",
  verifyToken,
  // checkPermission("stock.read"),
  logTransactionStockService.getLogTransactionStock
);
module.exports = router;