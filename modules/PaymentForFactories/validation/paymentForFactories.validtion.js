const { body } = require('express-validator');

const validatePaymentForFactory = [
  body('ourRequestId').notEmpty().withMessage('ourRequestId is required'),
  body('cashAmount').isInt({ min: 1 }).withMessage('unitsNumber should be a positive integer'),
  body('cashDate').notEmpty().withMessage('cashDate is required'),
  // body('wayOfPaymentId').notEmpty().withMessage('wayOfPaymentId is required'),
];

module.exports = validatePaymentForFactory;