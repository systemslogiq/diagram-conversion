import chalk from 'chalk';

class Logger {
  constructor(level = 'info') {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    this.level = this.levels[level] || 2;
  }

  error(message, ...args) {
    if (this.level >= this.levels.error) {
      console.error(chalk.red('[ERROR]'), message, ...args);
    }
  }

  warn(message, ...args) {
    if (this.level >= this.levels.warn) {
      console.warn(chalk.yellow('[WARN]'), message, ...args);
    }
  }

  info(message, ...args) {
    if (this.level >= this.levels.info) {
      console.log(chalk.blue('[INFO]'), message, ...args);
    }
  }

  debug(message, ...args) {
    if (this.level >= this.levels.debug) {
      console.log(chalk.gray('[DEBUG]'), message, ...args);
    }
  }
}

export const logger = new Logger(process.env.LOG_LEVEL || 'info');