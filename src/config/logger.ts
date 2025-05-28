// src/utils/Logger.ts

enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
  SUCCESS = "SUCCESS",
}

const COLORS = {
  RESET: "\x1b[0m",
  INFO: "\x1b[94m", // Soft Blue
  WARN: "\x1b[93m", // Soft Yellow
  METHOD: "\x1b[96m", // Light Cyan
  STATUS_OK: "\x1b[92m", // Soft Green
  STATUS_ERR: "\x1b[91m", // Soft Red
  PATH: "\x1b[90m", // Gray
  ERROR: "\x1b[91m", // Soft Red
  DEBUG: "\x1b[37m", // White/Grey
  TIME: "\x1b[2m", // Dim
  SUCCESS: "\x1b[92m", // Soft Green (same as STATUS_OK)
};

export class Logger {
  private static formatMessage(
    level: LogLevel,
    message: string,
    showTimestamp: boolean = true,
  ): string {
    const timestamp = showTimestamp
      ? `${COLORS.TIME}[${new Date().toISOString()}]${COLORS.RESET} `
      : "";
    let result = "";
    const color = COLORS[level];
    if (level == LogLevel.SUCCESS) {
      const badge = `${COLORS.SUCCESS} ✔ ${COLORS.RESET}`;
      result = `${timestamp} ${badge} ${color}${level}:${COLORS.RESET} ${message}`;
    }
    result = `${timestamp} ${color}${level}:${COLORS.RESET} ${message}`;
    return result;
  }

  static info(message: string, showTimestamp: boolean = true) {
    console.log(this.formatMessage(LogLevel.INFO, message, showTimestamp));
  }

  static warn(message: string, showTimestamp: boolean = true) {
    console.warn(this.formatMessage(LogLevel.WARN, message, showTimestamp));
  }

  static error(message: string, showTimestamp: boolean = true) {
    console.error(this.formatMessage(LogLevel.ERROR, message, showTimestamp));
  }

  static debug(message: string, showTimestamp: boolean = true) {
    if (Bun.env.MODE === "DEVELOPMENT") {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, showTimestamp));
    }
  }

  // Added success method
  static success(message: string, showTimestamp: boolean = true) {
    console.log(this.formatMessage(LogLevel.SUCCESS, message, showTimestamp));
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
