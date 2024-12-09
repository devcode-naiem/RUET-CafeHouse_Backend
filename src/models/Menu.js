// src/models/Menu.js
const pool = require('../config/database');
const logger = require('../utils/logger');

class Menu {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        image_url VARCHAR(255),
        is_available BOOLEAN DEFAULT true,
        visibility BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    try {
      await pool.query(query);
      logger.database('Menu items table created or already exists');
    } catch (error) {
      logger.error('Error creating menu items table:', error);
      throw error;
    }
  }

  static async addItems(items) {
    // Convert single item to array for consistent handling
    const itemsArray = Array.isArray(items) ? items : [items];
    
    const query = `
      INSERT INTO menu_items (name, type, price, description, image_url)
      VALUES ?
    `;

    const values = itemsArray.map(item => [
      item.name,
      item.type.toLowerCase(), // Store type in lowercase for consistency
      item.price,
      item.description || null,
      item.image_url || null
    ]);

    try {
      const [result] = await pool.query(query, [values]);
      logger.database(`Added ${result.affectedRows} menu items`);
      return result;
    } catch (error) {
      logger.error('Error adding menu items:', error);
      throw error;
    }
  }

  static async updateItems(items) {
    const itemsArray = Array.isArray(items) ? items : [items];
    const results = [];

    for (const item of itemsArray) {
      const query = `
        UPDATE menu_items 
        SET name = ?, type = ?, price = ?, description = ?, image_url = ?, is_available = ?
        WHERE id = ?
      `;

      try {
        const [result] = await pool.query(query, [
          item.name,
          item.type.toLowerCase(),
          item.price,
          item.description || null,
          item.image_url || null,
          item.is_available !== undefined ? item.is_available : true,
          item.id
        ]);
        results.push({ id: item.id, updated: result.affectedRows > 0 });
      } catch (error) {
        logger.error(`Error updating menu item ${item.id}:`, error);
        results.push({ id: item.id, error: error.message });
      }
    }

    return results;
  }

  static async deleteItems(ids) {
   
    
    const query = 'UPDATE menu_items SET is_available = 0 WHERE id = ?';

    try {
      const [result] = await pool.query(query, ids);
      logger.database(`Deleted ${result.affectedRows} menu items`);
      return result;
    } catch (error) {
      logger.error('Error deleting menu items:', error);
      throw error;
    }
  }

  static async getAllItems() {
    const query = 'SELECT * FROM menu_items WHERE is_available = true ORDER BY type, name';

    try {
      const [rows] = await pool.query(query);
      
      // Group items by type
      const groupedItems = rows.reduce((acc, item) => {
        const type = item.type.toLowerCase();
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(item);
        return acc;
      }, {});

      return groupedItems;
    } catch (error) {
      logger.error('Error getting menu items:', error);
      throw error;
    }
  }
}

module.exports = Menu;