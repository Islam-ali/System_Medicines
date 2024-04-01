const { body } = require('express-validator');

const validatePaymentForFactory = [
  body('request').notEmpty().withMessage('request is required'),
  body('date').notEmpty().withMessage('date is required'),
];

module.exports = validatePaymentForFactory;