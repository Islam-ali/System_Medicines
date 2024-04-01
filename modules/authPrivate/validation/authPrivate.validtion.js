const { body } = require('express-validator');

const validatePaymentForFactory = [
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = validatePaymentForFactory;