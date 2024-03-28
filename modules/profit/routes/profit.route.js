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

// Get all Profit Expences
router.get(
  "/getAllProfitAndIncomesAndExpencesInYear",
  verifyToken,
  profitService.getAllProfitAndIncomesAndExpencesInYear
);

router.get(
  "/getAllProfitIncomes",
  verifyToken,
  checkPermission('user.read') ,
  profitService.getAllProfitIncomes
);

router.get(
  "/getStatisticsAccountGroupbyYear",
  verifyToken,
  checkPermission("user.read"),
  profitService.getStatisticsAccountGroupbyYear
);

router.get("/getReportSales", verifyToken, profitService.getReportSales);

router.get("/getReportItemSales", verifyToken, profitService.getReportItemSales);


module.exports = router;