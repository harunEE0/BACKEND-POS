/**backend-pos/controller/customer */
const Customer = require('../models/customer')

exports.getCustomers = async (req, res, next) => {
    try {
      const customers = await Customer.find().sort('-createdAt');
      res.status(200).json({
        success: true,
        count: customers.length,
        data: customers,
      });
    } catch (err) {
      next(err);
    }
  };
  
  exports.getCustomer = async (req, res, next) => {
    try {
      const customer = await Customer.findById(req.params.id);
  
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }
  
      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (err) {
      next(err);
    }
  };
  
  exports.createCustomer = async (req, res, next) => {
    try {
      const customer = await Customer.create(req.body);
      res.status(201).json({
        success: true,
        data: customer,
      });
    } catch (err) {
      next(err);
    }
  };
  
  exports.updateCustomer = async (req, res, next) => {
    try {
      let customer = await Customer.findById(req.params.id);
  
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }
  
      customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
  
      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (err) {
      next(err);
    }
  };
  
  exports.deleteCustomer = async (req, res, next) => {
    try {
      const customer = await Customer.findById(req.params.id);
  
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }
  
      await customer.remove();
  
      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (err) {
      next(err);
    }
  };