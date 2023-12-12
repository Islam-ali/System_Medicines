const { body } = require('express-validator');

const validateTypeOfFactory = [
  body('type').trim().isLength({ min: 3, max: 50 }).withMessage('type must be between 3 and 50 characters'),
  body('classificationId').notEmpty().withMessage('Type Of classificationId is required'),
];

module.exports = validateTypeOfFactory;