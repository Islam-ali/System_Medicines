const express = require('express');
const router = express.Router();
const stockService = require('../services/stock.service');
const {verifyToken,checkUserRole} = require('../../../middelware/auth.middleware');

// Get all factories
router.get(
  "/getStock/:classificationId",
  verifyToken,
  checkUserRole("admin"),
  stockService.getStock
);

router.put(
  "/updateInfoInStock/:id",
  verifyToken,
  checkUserRole("admin"),
  stockService.updateInfoInStock
);
module.exports = router;