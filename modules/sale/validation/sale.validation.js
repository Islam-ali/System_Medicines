const { body } = require('express-validator');

const validateCity = [
  body('branchStockId').notEmpty().withMessage('branchStockId is required'),
  body('clientId').notEmpty().withMessage('clientId is required'),
  body('userId').notEmpty().withMessage('userId is required'),
  body('date').notEmpty().withMessage('date is required'),
  body('discount').notEmpty().withMessage('discount is required'),
  body('bonus').notEmpty().withMessage('bonus is required'),
  body('salesQuantity').isInt({ min: 1 }).withMessage('salesQuantity should be a positive integer'),
];

module.exports = validateCity;