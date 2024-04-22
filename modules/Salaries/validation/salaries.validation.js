const { body } = require('express-validator');

const validatePaymentSale = [
  body("employeeId").notEmpty().withMessage("employee is required"),
  body("date").notEmpty().withMessage("date is required"),
  body("amount")
    .isFloat({ min: 1 })
    .withMessage("amount should be a positive integer"),
];

module.exports = validatePaymentSale;