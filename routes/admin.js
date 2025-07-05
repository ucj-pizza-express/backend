const express = require('express');
const router = express.Router();
const Order = require('../Models/Order');
const User = require('../Models/User');

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    // Total Sales (only from PAID orders)
    const paidOrders = await Order.find({ paymentStatus: 'Paid' });

    let totalSales = 0;
    paidOrders.forEach(order => {
      if (typeof order.totalPrice === 'number') {
        totalSales += order.totalPrice;
      }
    });

    // New Customers (registered in last 30 days)
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const newCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: oneMonthAgo },
    });

    // Returning Customers (users with >1 orders using email)
    const allOrders = await Order.find();
    const orderCountsByEmail = {};

    allOrders.forEach(order => {
      const email = order.customer?.email;
      if (email) {
        orderCountsByEmail[email] = (orderCountsByEmail[email] || 0) + 1;
      }
    });

    const returningCustomers = Object.values(orderCountsByEmail).filter(count => count > 1).length;

    // Order Status Counts
    const deliveredOrders = await Order.countDocuments({ deliveryStatus: 'Delivered' });
    const pendingOrders = await Order.countDocuments({ deliveryStatus: 'Pending' });
    const cancelledOrders = await Order.countDocuments({ deliveryStatus: 'Cancelled' });

    res.json({
      totalSales,
      newCustomers,
      returningCustomers,
      deliveredOrders,
      pendingOrders,
      cancelledOrders
    });

  } catch (err) {
    console.error('📛 Error in /stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
