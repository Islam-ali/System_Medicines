const express = require("express");
const router = express.Router();
const PaymentPrivateService = require("../services/paymentPrivate.service");
const {
  verifyToken,
  checkPermission,
} = require("../../../middelware/auth.middleware");
const validatePaymentPrivate = require("../validation/paymentPrivate.validtion");

// Create a new factory
router.post(
  "/createPaymentPrivate",
  verifyToken,
  checkPermission("ourRequest.create"),
  validatePaymentPrivate,
  PaymentPrivateService.createPaymentPrivate
);

// Get all factories
router.get(
  "/getAllPaymentPrivate",
  verifyToken,
  checkPermission("ourRequest.read"),
  PaymentPrivateService.getAllPaymentPrivate
);

// Update a factory by ID
router.put(
  "/updatePaymentPrivate/:id",
  verifyToken,
  checkPermission("ourRequest.update"),
  validatePaymentPrivate,
  PaymentPrivateService.updatePaymentPrivate
);

// Delete a factory by ID
router.delete(
  "/deletePaymentPrivate/:id",
  verifyToken,
  checkPermission("ourRequest.delete"),
  PaymentPrivateService.deletePaymentPrivate
);

module.exports = router;
