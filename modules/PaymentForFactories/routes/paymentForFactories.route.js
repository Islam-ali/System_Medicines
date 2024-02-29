const express = require("express");
const router = express.Router();
const PaymentForFactoryService = require("../services/paymentForFactories.service");
const {
  verifyToken,
  checkPermission,
} = require("../../../middelware/auth.middleware");
const validatePaymentForFactory = require("../validation/paymentForFactories.validtion");

// Create a new factory
router.post(
  "/createPaymentForFactory",
  verifyToken,
  checkPermission("ourRequest.create"),
  validatePaymentForFactory,
  PaymentForFactoryService.createPaymentForFactory
);

// Get all factories
router.get(
  "/getAllPaymentForFactories",
  verifyToken,
  checkPermission("ourRequest.read"),
  PaymentForFactoryService.getAllPaymentForFactories
);

// total CashAmount And Balance Payment Factory
router.get(
  "/getTotalCashAmountAndBalanceByMonthPaymentFactory",
  verifyToken,
  checkPermission("ourRequest.read"),
  PaymentForFactoryService.totalCashAmountAndBalanceByMonthPaymentFactory
);

// total CashAmount And Balance Payment Factory
router.get(
  "/getTotalCashAmountAndBalanceByYearPaymentFactory",
  verifyToken,
  checkPermission("ourRequest.read"),
  PaymentForFactoryService.totalCashAmountAndBalanceByYearPaymentFactory
);
// get All Payment For Our Request
router.get(
  "/getAllPaymentForOurRequest",
  verifyToken,
  checkPermission("ourRequest.read"),
  PaymentForFactoryService.getAllPaymentForOurRequest
);

// Get a specific factory by ID
router.get(
  "/getPaymentForFactoryById/:id",
  verifyToken,
  checkPermission("ourRequest.read"),
  PaymentForFactoryService.getPaymentForFactoryById
);

// Get a Payment By FactoryId
router.get(
  "/getPaymentByFactoryId/:factoryId",
  verifyToken,
  checkPermission("ourRequest.read"),
  PaymentForFactoryService.getPaymentByFactoryId
);

// // Get factories by TypeOfFactoryId
// // router.get('/getPaymentForFactoryByFactoryId/:factoryId', verifyToken  , checkPermission('ourRequest.create') , PaymentForFactoryService.getPaymentForFactoryByFactoryId);

// Update a factory by ID
router.put(
  "/updatePaymentForFactory/:id",
  verifyToken,
  checkPermission("ourRequest.update"),
  validatePaymentForFactory,
  PaymentForFactoryService.updatePaymentForFactory
);

// Delete a factory by ID
router.delete(
  "/deletePaymentForFactory/:id",
  verifyToken,
  checkPermission("ourRequest.delete"),
  PaymentForFactoryService.deletePaymentForFactory
);

module.exports = router;
