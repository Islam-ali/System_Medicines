const express = require('express');
const router = express.Router();
const stockService = require('../services/stock.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');

// Get all factories
router.get(
  "/getStock/:classificationId",
  verifyToken,
  checkPermission("stock.read"),
  stockService.getStock
);

// Get all factories
router.get(
  "/getStockByClassificationId/:classificationId",
  verifyToken,
  checkPermission("stock.read"),
  stockService.getStockByClassificationId
);

router.get(
  "/getStockById/:id",
  verifyToken,
  checkPermission("stock.read"),
  stockService.getStockById
);

router.put(
  "/updateInfoInStock/:id",
  verifyToken,
  checkPermission("stock.update"),
  stockService.updateInfoInStock
);


router.put(
  "/transactionToBranchStock",
  verifyToken,
  checkPermission("stock.update"),
  stockService.transactionToBranchStock
);

module.exports = router;