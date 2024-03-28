const { body } = require('express-validator');

const validateClient = [
  body("title").notEmpty().withMessage("title is required"),
  body("description").notEmpty().withMessage("description is required"),
  body("date").notEmpty().withMessage("date is required"),
];

module.exports = validateClient;