const express = require("express");
const authService = require("../services/auth.service");
const validator = require("../validation/auth.validation");
const router = express.Router();
const {
  verifyToken,
  checkPermission,
} = require("../../../middelware/auth.middleware");

router.post(
  "/register",
  validator.validateRegistration,
  validator.validatePassword,
  authService.register
);

router.post("/login", validator.validateLogin, authService.login);

router.get(
  "/getUserById/:id",
  verifyToken,
  checkPermission("user.read"),
  authService.getUserById
);

router.get(
  "/getAllUsers",
  verifyToken,
  checkPermission("user.read"),
  authService.getAllUsers
);

router.put(
  "/updateUser/:id",
  verifyToken,
  checkPermission("user.update"),
  validator.validateRegistration,
  authService.updateUser
);

router.put(
  "/changeStatus/:id",
  verifyToken,
  checkPermission("user.update"),
  authService.changeStatus
);

module.exports = router;
