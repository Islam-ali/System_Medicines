const express = require('express');
const router = express.Router();
const {
  verifyToken,
  checkPermission,
} = require("../../../middelware/auth.middleware");

const expencesService  = require("../services/expences.service");

router.get(
  "/getAllExpences",
  verifyToken,
  checkPermission("user.read"),
  expencesService.getAllExpences
);

module.exports = router;