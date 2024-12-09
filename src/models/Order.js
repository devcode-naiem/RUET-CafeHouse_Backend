// src/models/Order.js
const pool = require('../config/database');
const logger = require('../utils/logger');

class Order {
  static async createTables() {
    // Create orders table
    const orderTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
        delivery_address TEXT,
        phone VARCHAR(15),
        special_instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;

    // Create order items table
    const orderItemsTableQuery = `
      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        menu_item_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
      )
    `;

    try {
      await pool.query(orderTableQuery);
      await pool.query(orderItemsTableQuery);
      logger.database('Order tables created successfully');
    } catch (error) {
      logger.error('Error creating order tables:', error);
      throw error;
    }
  }

  static async createOrder(userId, orderData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Insert main order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total_amount, delivery_address, phone, special_instructions) VALUES (?, ?, ?, ?, ?)',
        [userId, orderData.totalAmount, orderData.deliveryAddress, orderData.phone, orderData.specialInstructions]
      );

      const orderId = orderResult.insertId;

      // Insert order items
      for (const item of orderData.items) {
        await connection.query(
          'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.menuItemId, item.quantity, item.unitPrice, item.quantity * item.unitPrice]
        );
      }

      await connection.commit();
      logger.database(`Created new order with ID: ${orderId}`);
      return orderId;

    } catch (error) {
      await connection.rollback();
      logger.error('Error creating order:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateOrderStatus(orderId, status) {
    const query = 'UPDATE orders SET status = ? WHERE id = ?';
    
    try {
      const [result] = await pool.query(query, [status, orderId]);
      logger.database(`Updated order ${orderId} status to ${status}`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw error;
    }
  }

  static async getUserOrders(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        o.*,
        COUNT(*) OVER() as total_count
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    try {
      const [rows] = await pool.query(query, [userId, limit, offset]);
      const totalCount = rows[0]?.total_count || 0;
      
      return {
        orders: rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount
        }
      };
    } catch (error) {
      logger.error('Error getting user orders:', error);
      throw error;
    }
  }

  static async getAllOrders(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email,
        COUNT(*) OVER() as total_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    try {
      const [rows] = await pool.query(query, [limit, offset]);
      const totalCount = rows[0]?.total_count || 0;
      
      return {
        orders: rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount
        }
      };
    } catch (error) {
      logger.error('Error getting all orders:', error);
      throw error;
    }
  }

  static async getOrderDetails(orderId, userId = null) {
    // If userId is provided, ensure the order belongs to that user
    const orderQuery = `
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ? ${userId ? 'AND o.user_id = ?' : ''}
    `;

    const itemsQuery = `
      SELECT 
        oi.*,
        mi.name as item_name,
        mi.type as item_type
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
    `;

    try {
      const [orderRows] = await pool.query(orderQuery, userId ? [orderId, userId] : [orderId]);
      if (!orderRows.length) {
        return null;
      }

      const [itemRows] = await pool.query(itemsQuery, [orderId]);
      
      return {
        ...orderRows[0],
        items: itemRows
      };
    } catch (error) {
      logger.error('Error getting order details:', error);
      throw error;
    }
  }
}

module.exports = Order;
