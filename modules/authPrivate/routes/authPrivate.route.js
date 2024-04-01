const express = require("express");
const router = express.Router();
const authPrivateService = require("../services/authPrivate.service");
const {
  verifyToken,
  checkPermission,
} = require("../../../middelware/auth.middleware");
const validateauthPrivate = require("../validation/authPrivate.validtion");

// Create a new factory
router.post(
  "/login",
  verifyToken,
  checkPermission("ourRequest.create"),
  validateauthPrivate,
  authPrivateService.login
);



module.exports = router;
