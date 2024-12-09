// src/models/User.js
const pool = require('../config/database');
const logger = require('../utils/logger');

class User {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(15) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await pool.query(query);
      logger.database('Users table created or already exists');
    } catch (error) {
      logger.error('Error creating users table:', error);
      throw error;
    }
  }

  static async findByEmailOrPhone(email, phone) {
    const query = 'SELECT * FROM users WHERE email = ? OR phone = ?';
    
    try {
      const [rows] = await pool.query(query, [email, phone]);
      return rows[0];
    } catch (error) {
      logger.error('Error finding user:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    
    try {
      const [rows] = await pool.query(query, [email]);
      return rows[0];
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async create(userData) {
    const { name, email, phone, password } = userData;
    const query = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
    
    try {
      const [result] = await pool.query(query, [name, email, phone, password]);
      logger.database('New user created');
      return result.insertId;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }
}

module.exports = User;