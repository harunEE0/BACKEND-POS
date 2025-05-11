/**E:\learn-code\backend-pos\utils\helpers.js */
const { Types } = require('mongoose');
exports.generateOrderNumber = async () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${year}${month}${day}-${random}`;
  };
  
  exports.calculateOrderTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.07; // Example 7% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };
  
  exports.formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  exports.isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };
  exports.isValidObjectId = (id) => {
    return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
  };
  // ฟังก์ชันสำหรับการคำนวณเวลา
  exports.formatDate = (date, locale = 'th-TH') => {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  exports.checkRoles = (userRoles, allowedRoles) => {
    return userRoles.some(role => allowedRoles.includes(role));
  };