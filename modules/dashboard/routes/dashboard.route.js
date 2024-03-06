const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboard.service')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');


// Get all dashboard Incomes
router.get(
  "/getStatsticsAcountInYear",
  verifyToken,
  checkPermission('user.read') ,
  dashboardService.getStatsticsAcountInYear
);

router.get(
  "/getStatsticsAcountInMonth",
  verifyToken,
  checkPermission("user.read"),
  dashboardService.getStatsticsAcountInMonth
);

router.get(
  "/getStatsticsAccountGroupbyYear",
  verifyToken,
  checkPermission("user.read"),
  dashboardService.getStatsticsAccountGroupbyYear
);

module.exports = router;