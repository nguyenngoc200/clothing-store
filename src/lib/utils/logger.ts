import chalk from 'chalk';

export class Logging {
  /**
   * Log a standard message (no color)
   */
  static log(message: string): void {
    console.log(message);
  }

  /**
   * Log an error message (red)
   */
  static error(message: string): void {
    console.error(chalk.red(message));
  }

  /**
   * Log a warning message (yellow)
   */
  static warn(message: string): void {
    console.log(chalk.yellow(message));
  }

  /**
   * Log a success message (green)
   */
  static success(message: string): void {
    console.log(chalk.green(message));
  }

  /**
   * Log an info message (blue)
   */
  static info(message: string): void {
    console.log(chalk.blue(message));
  }

  /**
   * Log a header message (cyan)
   */
  static header(message: string): void {
    console.log(chalk.cyan(message));
  }

  /**
   * Log a critical message (red, bold)
   */
  static critical(message: string): void {
    console.log(chalk.red.bold(message));
  }
}
