const { body } = require('express-validator');

const validateClient = [
  body('name').trim().isLength({ min: 3, max: 50 }).withMessage('type must be between 3 and 50 characters'),
  body('typeOfClient').notEmpty().withMessage('type Of Client is required'),
  body('cityId').notEmpty().withMessage('city is required'),
];

module.exports = validateClient;