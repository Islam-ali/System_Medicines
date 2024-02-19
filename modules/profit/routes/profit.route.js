const express = require('express');
const router = express.Router();
const profitService = require('../services/profit.service')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');


// Get all Profit Incomes
router.get(
  "/getAllProfitByIncomes",
  verifyToken,
  profitService.getAllProfitByIncomes
);

// Get all Profit Incomes
router.get(
  "/getTotalRecivedAndBalanceAndProfit",
  verifyToken,
  profitService.getTotalRecivedAndBalanceAndProfit
);

// Get all Profit Expences
router.get(
  "/getAllExpences",
  verifyToken,
  profitService.getAllExpences
);

// Get Total WasPaid And Balance
router.get(
  "/getTotalCashAmountAndBalance",
  verifyToken,
  profitService.getTotalCashAmountAndBalance
);

module.exports = router;