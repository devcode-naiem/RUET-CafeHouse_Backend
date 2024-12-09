// server.js
require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');
const config = require('./src/config/config');
const createTables = require('./create-tables')
const PORT = config.port || 3000;


app.listen(PORT, () => {
  logger.system(`Server is running on port ${PORT}`);
});