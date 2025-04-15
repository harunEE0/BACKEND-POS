const { check } = require('express-validator');

exports.productValidator = [
  check('name', 'Product name is required').not().isEmpty(),
  check('price', 'Price must be a number and greater than 0').isFloat({ min: 0 }),
  check('stock', 'Stock must be an integer and not negative').isInt({ min: 0 }),
];