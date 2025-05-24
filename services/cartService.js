/**backend-pos/services/cartService */
const Product = require('../models/product');
const Redisclient = require('../config/redis');
const logger = require('../utils/logger');



class CartService{
  constructor(){
    this.redis = Redisclient;
    this.CART_TTL = 86400 * 7
  }

  _getcartKey (userId){
    return `cart:${userId}`;
  }


  async addItem({userId,productId,quantity}){
    try {
      const product = await Product.findById(productId);
      if(!product){
        throw new Error('Product not found');
      }

      if (product.stock < quantity) {
        throw new Error('Insufficient stock');
      }

      const cartKey = this._getcartKey(userId);

       await this.redis.hset(cartKey, productId, JSON.stringify({ 
        productId,
        quantity,
        price: product.price,
        name: product.name,
        image: product.image[0] || null,
       }));

       await this.redis.expire(cartKey, this.CART_TTL);

       return await this._getcartKey(userId);
    } catch (error) {
      logger.error(`Error adding item to cart: ${error.message}`);
      throw error;
      
    }
  }

  async getCart(userId){
    try {
     const cartKey = this._getcartKey(userId);
     const cartItem = await this.redis.hgetall(cartKey);

     const Item = [];
     let subtotal = 0;
     for(const [productId, itemStr ] of Object.entries(cartItem)){
      const item  = JSON.parse(itemStr);
      item.productId = productId;
      subtotal += item.price * item.quantity;
     }

      const taxRate = 0.07;
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      return {
        items: Item,
        summary:{
          subtotal: subtotal,
          tax: tax,
          total: total,
          itemCount: item.length,
        }
      };
    } catch (error) {
      logger.error(`Error getting cart: ${error.message}`);
      throw error;
    }
  }




  async removeItem (userId, productId) {
      try {
        const cartKey = this._getcartKey(userId);
        await this.redis.hdel(cartKey, productId);
        return await this.getCart(userId)
      } catch (error) {
        logger.error(`Error removing item from cart: ${error.message}`);
        throw error;
        
      }
  }


  async updateItem ({userId, productId, quantity}) {

    try {
      const cartKey = this._getcartKey(userId);
      const itemStr = await this.redis.hget(cartKey, productId);
      if(!itemStr){
        throw new Error('Item not found in cart');
      } 
      const item = JSON.parse(itemStr);
      item.quantity = quantity;

      await this.redis.hset(cartKey, productId, JSON.stringify(item));
      return await this.getCart(userId);
    } catch (error) {
      logger.error(`Error updating item in cart: ${error.message}`);
      throw error;
      
    }


    

  // คำนวณสรุปคำสั่งซื้อ
 
}
async clearCart(userId) {
    try {
      const cartKey = this._getCartKey(userId);
      await this.redis.del(cartKey);
      return { success: true };
    } catch (error) {
      logger.error(`CartService.clearCart error: ${error.message}`);
      throw error;
    }
  }

 async calculateSummary(items) {
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      subtotal += product.price * item.quantity;
    }

    const taxRate = 0.07;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total
    };
  }

}


module.exports =new CartService();
