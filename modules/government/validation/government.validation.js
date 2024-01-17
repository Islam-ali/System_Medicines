const { body } = require('express-validator');

const validateGovernment = [
  body('name').notEmpty().withMessage('name is required'),
];

module.exports = validateGovernment;