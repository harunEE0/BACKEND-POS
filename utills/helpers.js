/**E:\learn-code\backend-pos\utills\helpers.js */

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
  
  // ฟังก์ชันสำหรับการคำนวณเวลา
  exports.formatDate = (date) => {
    return new Date(date).toLocaleString();
  };