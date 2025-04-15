const express = require('express');
const router = express.Router();
const { calculateSummary } = require('../services/cartService');

// คำนวณสรุปคำสั่งซื้อ
router.post('/summary', async (req, res) => {
  try {
    const summary = await calculateSummary(req.body.items);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
