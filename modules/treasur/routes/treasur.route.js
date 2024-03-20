const express = require("express");
const router = express.Router();
const treasur = require("../services/treasur.service");
const {
  verifyToken,
  checkPermission,
} = require("../../../middelware/auth.middleware");

router.get(
  "/getAllTreasur",
  verifyToken,
  checkPermission("stock.read"),
  treasur.getAllTreasur
);

router.post(
  "/createTreasur",
  verifyToken,
  checkPermission("stock.create"),
  treasur.createTreasur
);

router.put(
  "/updateTreasur/:id",
  verifyToken,
  checkPermission("stock.update"),
  treasur.updateTreasur
);

router.delete(
  "/deleteTreasur/:id",
  verifyToken,
  checkPermission("stock.delete"),
  treasur.deleteTreasur
);

module.exports = router;
