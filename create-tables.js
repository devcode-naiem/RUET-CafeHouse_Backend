const User = require('./src/models/User');
const logger = require('./src/utils/logger');
const Menu = require('./src/models/Menu');
const Order = require('./src/models/Order');
async function createTables() {
  try {
    await User.createTable();
    await Menu.createTable();
    await Order.createTables();
    logger.system('All tables created successfully');
     
  } catch (error) {
    logger.error('Error creating tables:', error);
    process.exit(1);
  }
}

module.exports = createTables();