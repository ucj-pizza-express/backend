const express = require("express");
const router = express.Router();
const Order = require("../Models/Order");

// POST /api/order
router.post('/', async (req, res) => {
  try {
    console.log("📦 Incoming Order Payload:", req.body);

    const order = new Order(req.body);
    const savedOrder = await order.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("❌ Error saving order:", error.message);
    res.status(500).json({ message: 'Failed to save order', error: error.message });
  }
});



// Optional: GET all orders (for admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderTime: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PATCH /api/orders/:id -> Update order status
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("❌ Failed to update order:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PATCH /api/order/:id - Update order status
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("❌ Failed to update order status:", error.message);
    res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
});

module.exports = router;
