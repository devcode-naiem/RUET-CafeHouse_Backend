// src/controllers/orderController.js
const Order = require('../models/Order');
const logger = require('../utils/logger');
const { validateOrderData } = require('../utils/validators');

const orderController = {
  // Create new order
  async createOrder(req, res) {
    try {
      const userId = req.userId; // From auth middleware
      const orderData = req.body;

      // Validate order data
      const validationErrors = validateOrderData(orderData);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          errors: validationErrors
        });
      }

      const orderId = await Order.createOrder(userId, orderData);
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { orderId }
      });

    } catch (error) {
      logger.error('Error in createOrder controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating order'
      });
    }
  },

  // Update order status (admin only)
  async updateOrderStatus(req, res) {
    try {
      const { orderId, status } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({
          success: false,
          message: 'Order ID and status are required'
        });
      }

      const updated = await Order.updateOrderStatus(orderId, status);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        message: 'Order status updated successfully'
      });

    } catch (error) {
      logger.error('Error in updateOrderStatus controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating order status'
      });
    }
  },

  // Get user's orders
  async getUserOrders(req, res) {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Order.getUserOrders(userId, page, limit);
      
      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Error in getUserOrders controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving orders'
      });
    }
  },

  // Get all orders (admin only)
  async getAllOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Order.getAllOrders(page, limit);
      
      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Error in getAllOrders controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving orders'
      });
    }
  },

  // Get specific order details
  async getOrderDetails(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.role === 'admin' ? null : req.userId;

      const orderDetails = await Order.getOrderDetails(orderId, userId);
      
      if (!orderDetails) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: orderDetails
      });

    } catch (error) {
      logger.error('Error in getOrderDetails controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving order details'
      });
    }
  }
};

module.exports = orderController;
