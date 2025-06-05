
//E:\learn-code\backend-pos\controllers\storeController.js

const { json } = require('express');
const StoreService = require('../services/storeService');
const ErrorResponse = require('../utils/ErrorResponse');

exports.createStore = async (req, res, next) => {
  try {
    const store = await StoreService.createStore(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: store
    });
  } catch (error) {
    next(error);
  }
};


exports.getAllStores  = async (req,res,next) =>{
  try {
    const stores = await StoreService.getAllStores(req.pa);
    res.status(200).json({ 
      success: true, 
      count: stores.length,
      data: stores 
    });

  } catch (error) {
    next(error)
  }
};



exports.getStore = async (req, res, next) => {
  try {
    const store = await StoreService.getStore(req.params.storeId);
    res.status(200).json({
      success: true,
      data: store
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStore = async (req, res, next) => {
  try {
    const store = await StoreService.updateStore(
      req.params.storeId, 
      req.body
    );
    res.status(200).json({
      success: true,
      data: store
    });
  } catch (error) {
    next(error);
  }
};

exports.addStoreUser = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const storeUser = await StoreService.addStoreUser(
      req.params.storeId, 
      userId, 
      role
    );
    res.status(201).json({
      success: true,
      data: storeUser
    });
  } catch (error) {
    next(error);
  }
};

exports.getStoreUsers = async (req, res, next) => {
  try {
    const users = await StoreService.getStoreUsers(req.params.storeId);
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

exports.changeUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    const storeUser = await StoreService.changeUserRole(
      req.params.storeId,
      userId,
      role
    );
    
    res.status(200).json({
      success: true,
      data: storeUser
    });
  } catch (error) {
    next(error);
  }
};

exports.removeStoreUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await StoreService.removeStoreUser(req.params.storeId, userId);
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyStores = async (req, res, next) => {
  try {
    const stores = await StoreService.getUserStores(req.user.id);
    res.status(200).json({
      success: true,
      data: stores
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteStore = async (req, res, next) => {
  try {
    await StoreService.deleteStore(req.params.storeId);
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};