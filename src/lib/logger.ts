/**
 * Production Structured Logger
 */

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogPayload {
  level: LogLevel;
  message: string;
  subdomain?: string;
  userId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

class Logger {
  private formatLog(payload: LogPayload): string {
    return JSON.stringify(payload);
  }

  info(message: string, context: Omit<Partial<LogPayload>, "level" | "message" | "timestamp"> = {}) {
    const payload: LogPayload = {
      level: "INFO",
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };
    console.log(this.formatLog(payload));
  }

  warn(message: string, context: Omit<Partial<LogPayload>, "level" | "message" | "timestamp"> = {}) {
    const payload: LogPayload = {
      level: "WARN",
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };
    console.warn(this.formatLog(payload));
  }

  error(message: string, context: Omit<Partial<LogPayload>, "level" | "message" | "timestamp"> = {}) {
    const payload: LogPayload = {
      level: "ERROR",
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };
    console.error(this.formatLog(payload));
  }
}

export const logger = new Logger();
