  
  // src/config/database.js
  const mysql = require('mysql2/promise');
  const config = require('./config');
  const logger = require('../utils/logger');
  
  const pool = mysql.createPool({
    ...config.dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  pool.on('connection', () => {
    logger.database('New database connection established');
  });
  
  pool.on('error', (err) => {
    logger.error('Database error:', err);
  });
  
  module.exports = pool;