const express = require('express');
const router = express.Router();
const profitService = require('../services/profit.service')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');


// Get all Profit Incomes
router.get(
  "/getAllIncomes",
  verifyToken,
  checkPermission('user.read') ,
  profitService.getAllIncomes
);


// Get all Profit Expences
router.get(
  "/getAllProfitAndIncomesAndExpences",
  verifyToken,
  profitService.getAllProfitAndIncomesAndExpences
);

router.get(
  "/getAllProfitIncomes",
  verifyToken,
  checkPermission('user.read') ,
  profitService.getAllProfitIncomes
);

module.exports = router;