const { body } = require('express-validator');

const validateCity = [
  body('name').notEmpty().withMessage('name is required'),
  body('governmentId').notEmpty().withMessage('government is required'),
];

module.exports = validateCity;