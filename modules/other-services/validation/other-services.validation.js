const { body } = require('express-validator');

const validatePaymentSale = [
  body("description").notEmpty().withMessage("description is required"),
  body("date").notEmpty().withMessage("date is required"),
  body("amount")
    .isFloat({ min: 1 })
    .withMessage("amount should be a positive integer"),
];

module.exports = validatePaymentSale;