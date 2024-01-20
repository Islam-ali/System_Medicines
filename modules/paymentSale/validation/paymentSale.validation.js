const { body } = require('express-validator');

const validatePaymentSale = [
  body('saleId').notEmpty().withMessage('branchStockId is required'),
  body('recipientId').notEmpty().withMessage('clientId is required'),
  body('date').notEmpty().withMessage('date is required'),
  body('amount').isInt({ min: 1 }).withMessage('salesQuantity should be a positive integer'),
];

module.exports = validatePaymentSale;