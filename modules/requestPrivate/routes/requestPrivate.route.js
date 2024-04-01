const express = require("express");
const router = express.Router();
const requestPrivateService = require("../services/requestPrivate.service");
const {
  verifyToken,
  checkPermission,
} = require("../../../middelware/auth.middleware");
const validateRequestPrivate = require("../validation/requestPrivate.validtion");

// Create a new factory
router.post(
  "/createRequestPrivate",
  verifyToken,
  checkPermission("ourRequest.create"),
  validateRequestPrivate,
  requestPrivateService.createRequestPrivate
);

// Get all factories
router.get(
  "/getAllRequestPrivate",
  verifyToken,
  checkPermission("ourRequest.read"),
  requestPrivateService.getAllRequestPrivate
);

// Update a factory by ID
router.put(
  "/updateRequestPrivate/:id",
  verifyToken,
  checkPermission("ourRequest.update"),
  validateRequestPrivate,
  requestPrivateService.updateRequestPrivate
);

// Delete a factory by ID
router.delete(
  "/deleteRequestPrivate/:id",
  verifyToken,
  checkPermission("ourRequest.delete"),
  requestPrivateService.deleteRequestPrivate
);

module.exports = router;
