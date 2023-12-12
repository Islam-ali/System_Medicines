const { body } = require('express-validator');

const validateItemsFactory = [
  body('name').trim().isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters'),
  body('factoryId').notEmpty().withMessage('FactoryId is required'),
];

module.exports = validateItemsFactory;