const { body } = require('express-validator');

const validateFactory = [
  body('name').trim().isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters'),
  body('typeOfFactoryId').notEmpty().withMessage('TypeOfFactoryId is required'),
];

module.exports = validateFactory;