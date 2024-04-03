const { body } = require('express-validator');

const validatedebtor = [
  body('title').notEmpty().withMessage('title is required'),
  body('amount').isInt({ min: 1 }).withMessage('amount should be a positive integer'),
  body('date').notEmpty().withMessage('date is required'),
  // body('wayOfPaymentId').notEmpty().withMessage('wayOfPaymentId is required'),
];

module.exports = validatedebtor;