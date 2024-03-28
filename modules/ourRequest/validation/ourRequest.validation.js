const { body } = require('express-validator');

const validateOurRequest = [
  body('itemFactoryId').notEmpty().withMessage('itemId is required'),
  body('unitsNumber').notEmpty().withMessage('unitsNumber is required'),
  body('unitsCost').notEmpty().withMessage('unitsCost is required'),
  // body('orderType').notEmpty().withMessage('orderType is required'),
  // body('wasPaid').notEmpty().withMessage('wasPaid is required'),
  body('listOfMaterials.*.itemFactoryId').isMongoId().withMessage('Invalid itemId'),
  body('listOfMaterials.*.unitsNumber').isInt({ min: 1 }).withMessage('unitsNumber should be a positive integer'),
];

module.exports = validateOurRequest;
