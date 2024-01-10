
const { body } = require('express-validator');

const validateRegistration = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email'),
  body('phoneNumber').matches(/^\+?\d{8,14}$/).withMessage('Invalid phone number'),
  // body('roleId').notEmpty().withMessage('role is required')
];

const validatePassword = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords don't match");
    }
    return true;
  }),
]

const validateLogin = [
  body('username').notEmpty().withMessage('Username is required').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').notEmpty().withMessage('Username is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

module.exports = {validateRegistration , validateLogin , validatePassword}