const express = require("express");
const router = express.Router();
const note = require("../services/note.service");
const validatenote = require("../validation/note.validation");
const {
  verifyToken,
  checkPermission,
} = require("../../../middelware/auth.middleware");

router.get(
  "/getAllnote",
  verifyToken,
  checkPermission("clients.read"),
  note.getAllnote
);

router.post(
  "/createnote",
  verifyToken,
  checkPermission("clients.create"),
  validatenote,
  note.createnote
);

router.put(
  "/updatenote/:id",
  verifyToken,
  checkPermission("clients.update"),
  validatenote,
  note.updatenote
);

router.delete(
  "/deletenote/:id",
  verifyToken,
  checkPermission("clients.delete"),
  note.deletenote
);

module.exports = router;
