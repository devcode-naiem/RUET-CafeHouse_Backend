// src/routes/orderRoutes.js
const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
// const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// User routes
router.post('/create', authMiddleware, orderController.createOrder);
router.get('/my-orders', authMiddleware, orderController.getUserOrders);
router.get('/my-orders/:orderId', authMiddleware, orderController.getOrderDetails);

// Admin routes
router.get('/all', authMiddleware, orderController.getAllOrders);
router.put('/status', authMiddleware, orderController.updateOrderStatus);
router.get('/details/:orderId', authMiddleware, orderController.getOrderDetails);

module.exports = router;
