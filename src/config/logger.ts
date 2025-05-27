// src/utils/Logger.ts

enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

const COLORS = {
  RESET: "\x1b[0m",
  INFO: "\x1b[94m", // Soft Blue
  WARN: "\x1b[93m", // Soft Yellow (less aggressive)
  METHOD: "\x1b[96m", // Light Cyan (calmer than magenta)
  STATUS_OK: "\x1b[92m", // Soft Green
  STATUS_ERR: "\x1b[91m", // Soft Red
  PATH: "\x1b[90m", // Gray
  ERROR: "\x1b[91m", // Soft Red
  DEBUG: "\x1b[37m", // White/Grey
  TIME: "\x1b[2m", // Dim
};

export class Logger {
  private static formatMessage(level: LogLevel, message: string): string {
    const timestamp = `${COLORS.TIME}[${new Date().toISOString()}]${COLORS.RESET}`;
    const color = COLORS[level];
    return `${timestamp} ${color}${level}:${COLORS.RESET} ${message}`;
  }

  static info(message: string) {
    console.log(this.formatMessage(LogLevel.INFO, message));
  }

  static warn(message: string) {
    console.warn(this.formatMessage(LogLevel.WARN, message));
  }

  static error(message: string) {
    console.error(this.formatMessage(LogLevel.ERROR, message));
  }

  static debug(message: string) {
    if (Bun.env.MODEV === "development") {
      console.debug(this.formatMessage(LogLevel.DEBUG, message));
    }
  }

  static logHttp(method: string, status: number, path: string) {
    const timestamp = `${COLORS.TIME}[${new Date().toISOString()}]${COLORS.RESET}`;

    const methodColor = COLORS.METHOD;
    const statusColor =
      status >= 200 && status < 400 ? COLORS.STATUS_OK : COLORS.STATUS_ERR;
    const pathColor = COLORS.PATH;

    const formatted =
      `${timestamp} ${methodColor}${method}${COLORS.RESET} ` +
      `${statusColor}${status}${COLORS.RESET} ` +
      `${pathColor}${path}${COLORS.RESET}`;

    console.log(formatted);
  }
}
