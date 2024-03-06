const express = require("express");
const router = express.Router();
const doctor = require("../services/doctor.service");
const validateDoctor = require("../validation/doctor.validation");
const {
  verifyToken,
  checkPermission,
} = require("../../../middelware/auth.middleware");

router.get(
  "/getAllDoctor",
  verifyToken,
  checkPermission("clients.read"),
  doctor.getAllDoctor
);

router.post(
  "/createDoctor",
  verifyToken,
  checkPermission("clients.create"),
  validateDoctor,
  doctor.createDoctor
);

router.put(
  "/updateDoctor/:id",
  verifyToken,
  checkPermission("clients.update"),
  validateDoctor,
  doctor.updateDoctor
);

router.delete(
  "/deleteDoctor/:id",
  verifyToken,
  checkPermission("clients.delete"),
  doctor.deleteDoctor
);

module.exports = router;
