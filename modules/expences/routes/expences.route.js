const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../../middelware/auth.middleware');
const expencesService  = require("../services/expences.service");

router.get(
  "/getAllExpences",
  verifyToken,
  expencesService.getAllExpences
);

module.exports = router;