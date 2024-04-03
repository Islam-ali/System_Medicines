const express = require("express");
const router = express.Router();
const debtorPrivateService = require("../services/debtorPrivate.service");
const {
  verifyToken,
  checkPermission,
} = require("../../../middelware/auth.middleware");
const validatedebtorPrivate = require("../validation/debtorPrivate.validtion");

// Create a new factory
router.post(
  "/createdebtorPrivate",
  verifyToken,
  checkPermission("ourRequest.create"),
  validatedebtorPrivate,
  debtorPrivateService.createdebtorPrivate
);

// Get all factories
router.get(
  "/getAlldebtorPrivate",
  verifyToken,
  checkPermission("ourRequest.read"),
  debtorPrivateService.getAlldebtorPrivate
);

// Update a factory by ID
router.put(
  "/updatedebtorPrivate/:id",
  verifyToken,
  checkPermission("ourRequest.update"),
  validatedebtorPrivate,
  debtorPrivateService.updatedebtorPrivate
);

// Delete a factory by ID
router.delete(
  "/deletedebtorPrivate/:id",
  verifyToken,
  checkPermission("ourRequest.delete"),
  debtorPrivateService.deletedebtorPrivate
);

module.exports = router;
