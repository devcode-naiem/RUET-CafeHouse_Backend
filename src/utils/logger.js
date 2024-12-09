// src/utils/logger.js
const chalk = require('chalk');

class Logger {
  static request(message) {
    console.log(chalk.blue('🌐 REQUEST:'), chalk.blue(message));
  }

  static error(message, error = '') {
    console.log(
      chalk.red('❌ ERROR:'),
      chalk.red(message),
      error ? chalk.red(JSON.stringify(error)) : ''
    );
  }

  static database(message) {
    console.log(chalk.magenta('🗄️ DATABASE:'), chalk.magenta(message));
  }

  static system(message) {
    console.log(chalk.green('🚀 SYSTEM:'), chalk.green(message));
  }

  static info(message) {
    console.log(chalk.cyan('ℹ️ INFO:'), chalk.cyan(message));
  }

  static warn(message) {
    console.log(chalk.yellow('⚠️ WARNING:'), chalk.yellow(message));
  }
}

module.exports = Logger;