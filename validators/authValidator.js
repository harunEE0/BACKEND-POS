const { check } = require('express-validator');

exports.registerValidator = [
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('role', 'Role is required').not().isEmpty(),
];

exports.loginValidator = [
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password is required').exists(),
];