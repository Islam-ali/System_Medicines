const { body } = require('express-validator');

const validateCity = [
  body('clientId').notEmpty().withMessage('clientId is required'),
  body('date').notEmpty().withMessage('date is required'),
  // body('branchStockId').notEmpty().withMessage('branchStockId is required'),
  // body('userId').notEmpty().withMessage('userId is required'),
  // body('discount').notEmpty().withMessage('discount is required'),
  // body('bonus').notEmpty().withMessage('bonus is required'),
  
  body('listOfSales.*.branchStockId').isMongoId().withMessage('branchStockId  is required'),
  // body('listOfSales.*salesQuantity').isFloat({ min: 1 }).withMessage('salesQuantity should be a positive integer'),

];

module.exports = validateCity;