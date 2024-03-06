const { body } = require('express-validator');

const validatePaymentSale = [
  body("doctorId").notEmpty().withMessage("doctor is required"),
  body("date").notEmpty().withMessage("date is required"),
  body("amount")
    .isInt({ min: 1 })
    .withMessage("amount should be a positive integer"),
];

module.exports = validatePaymentSale;