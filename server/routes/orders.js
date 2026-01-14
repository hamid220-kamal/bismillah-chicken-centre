const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const User = require('../models/User');

const router = express.Router();

// Auth middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'No token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

// Create order
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { items, subtotal, deliveryFee, total, customerName, phone, address, landmark, deliveryTime, notes } = req.body;

        const order = await Order.create({
            user: req.user._id,
            items,
            subtotal,
            deliveryFee,
            total,
            customerName,
            phone,
            address,
            landmark,
            deliveryTime,
            notes,
            status: 'pending',
            statusHistory: [{ status: 'pending', note: 'Order placed' }]
        });

        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user's orders
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all orders (admin)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name phone').sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update order status (admin)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        order.status = status;
        order.statusHistory.push({ status, note: note || `Status changed to ${status}` });
        await order.save();

        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cancel order (user can cancel pending orders)
router.put('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Can only cancel pending orders' });
        }

        order.status = 'cancelled';
        order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by user' });
        await order.save();

        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get order stats (admin)
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const stats = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } }
        ]);
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
