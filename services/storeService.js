//E:\learn-code\backend-pos\services\storeService.js


const Store = require('../models/store/store');
const StoreUser = require('../models/store/storeUser');
const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/logger');
const mongoose = require('mongoose');   

class StoreService {
  // สร้างร้านค้าใหม่
  async createStore(storeData, ownerId) {
    try {
      // สร้างร้านค้า
      const store = await Store.create({
        ...storeData,
        owner: ownerId
      });

      // เซ็ตเจ้าของร้าน
      await StoreUser.create({
        store: store._id,
        user: ownerId,
        role: 'owner'
      });

      logger.info(`Store created: ${store._id} by user ${ownerId}`);
      return store;
    } catch (error) {
      logger.error(`Error creating store: ${error.message}`);
      throw error;
    }
  }

  // เพิ่มผู้ใช้ในร้านค้า
  async addStoreUser(storeId, userId, role) {
    try {
      // ตรวจสอบว่าผู้ใช้มีอยู่จริง
      const user = await User.findById(userId);
      if (!user) {
        throw new ErrorResponse('ไม่พบผู้ใช้', 404);
      }

      // เพิ่มผู้ใช้ในร้าน
      const storeUser = await StoreUser.create({
        store: storeId,
        user: userId,
        role
      });

      logger.info(`User ${userId} added to store ${storeId} as ${role}`);
      return storeUser;
    } catch (error) {
      logger.error(`Error adding user to store: ${error.message}`);
      throw error;
    }
  }

  // ดูข้อมูลร้านค้า
  async getStore(storeId) {
    try {
      const store = await Store.findById(storeId);
      if (!store) {
        throw new ErrorResponse('ไม่พบร้านค้า', 404);
      }
      return store;
    } catch (error) {
      logger.error(`Error getting store: ${error.message}`);
      throw error;
    }
  }
   // ดูข้อมูลร้านค้าทั้งหมด
  async getAllStores () {
    try {
       const stores = await Store.find().lean();
      if (!stores || stores.length === 0) {
        throw new ErrorResponse('ไม่พบร้านค้า', 404);
      }
      return stores;
    } catch (error) {
      logger.error(`Error getting store: ${error.message}`);
      throw error;
    }
  }

  // อัปเดตร้านค้า
  async updateStore(storeId, updateData) {
    try {
      const store = await Store.findByIdAndUpdate(
        storeId,
        updateData,
        { new: true, runValidators: true }
      );
      if (!store) {
        throw new ErrorResponse('ไม่พบร้านค้า', 404);
      }
      logger.info(`Store updated: ${storeId}`);
      return store;
    } catch (error) {
      logger.error(`Error updating store: ${error.message}`);
      throw error;
    }
  }

  // ดึงรายการผู้ใช้ทั้งหมดในร้าน
  async getStoreUsers(storeId) {
    try {
      const storeUsers = await StoreUser.find({ store: storeId })
        .populate('user', 'username email')
        .select('-__v');
      
      return storeUsers;
    } catch (error) {
      logger.error(`Error getting store users: ${error.message}`);
      throw error;
    }
  }

  // เปลี่ยนบทบาทผู้ใช้ในร้าน
  async changeUserRole(storeId, userId, newRole) {
    try {
      const storeUser = await StoreUser.findOneAndUpdate(
        { store: storeId, user: userId },
        { role: newRole },
        { new: true, runValidators: true }
      );
      
      if (!storeUser) {
        throw new ErrorResponse('ไม่พบผู้ใช้ในร้านนี้', 404);
      }

      logger.info(`User ${userId} role changed to ${newRole} in store ${storeId}`);
      return storeUser;
    } catch (error) {
      logger.error(`Error changing user role: ${error.message}`);
      throw error;
    }
  }

  // ลบผู้ใช้ออกจากร้าน
  async removeStoreUser(storeId, userId) {
    try {
      const storeUser = await StoreUser.findOneAndDelete({
        store: storeId,
        user: userId
      });

      if (!storeUser) {
        throw new ErrorResponse('ไม่พบผู้ใช้ในร้านนี้', 404);
      }

      logger.info(`User ${userId} removed from store ${storeId}`);
      return storeUser;
    } catch (error) {
      logger.error(`Error removing user from store: ${error.message}`);
      throw error;
    }
  }

  // ดึงร้านค้าทั้งหมดของผู้ใช้
  async getUserStores(userId) {
    try {
      const storeUsers = await StoreUser.find({ user: userId })
        .populate('store', 'name description')
        .select('role store');
      
      return storeUsers.map(su => ({
        role: su.role,
        ...su.store.toObject()
      }));
    } catch (error) {
      logger.error(`Error getting user stores: ${error.message}`);
      throw error;
    }
  }
async deleteStore(storeId) {
  try {
    logger.info(`Starting to delete store ${storeId}`);
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const store = await Store.findByIdAndDelete(storeId).session(session);
      if (!store) {
        logger.warn(`Store not found: ${storeId}`);
        throw new ErrorResponse('ไม่พบร้านค้า', 404);
      }

      await StoreUser.deleteMany({ store: storeId }).session(session);
      logger.info(`Deleted ${storeId} and related records`);
      
      await session.commitTransaction();
      return store;
    } catch (error) {
      logger.error(`Error in transaction: ${error.message}`);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    logger.error(`Store deletion failed: ${error.message}`);
    throw error;
  }
}
}

module.exports = new StoreService();