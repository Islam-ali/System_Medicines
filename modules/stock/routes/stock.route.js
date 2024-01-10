const express = require('express');
const router = express.Router();
const stockService = require('../services/stock.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');

// Get all factories
router.get(
  "/getStock/:classificationId",
  verifyToken,
  checkPermission("admin"),
  stockService.getStock
);

router.put(
  "/updateInfoInStock/:id",
  verifyToken,
  checkPermission("admin"),
  stockService.updateInfoInStock
);
module.exports = router;