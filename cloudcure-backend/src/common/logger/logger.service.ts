import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.formatLog('LOG', message, context || this.context);
  }

  error(message: string, trace?: string, context?: string) {
    this.formatLog('ERROR', message, context || this.context, trace);
  }

  warn(message: string, context?: string) {
    this.formatLog('WARN', message, context || this.context);
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.formatLog('DEBUG', message, context || this.context);
    }
  }

  verbose(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.formatLog('VERBOSE', message, context || this.context);
    }
  }

  private formatLog(
    level: string,
    message: string,
    context?: string,
    trace?: string,
  ) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    const pid = process.pid;

    const logMessage = `[${timestamp}] [${pid}] ${this.getColorForLevel(level)}${level}\x1b[0m ${contextStr} ${message}`;

    // Use appropriate console method based on level
    switch (level) {
      case 'ERROR':
        console.error(logMessage);
        if (trace) {
          console.error(trace);
        }
        break;
      case 'WARN':
        console.warn(logMessage);
        break;
      case 'DEBUG':
      case 'VERBOSE':
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  private getColorForLevel(level: string): string {
    const colors: Record<string, string> = {
      LOG: '\x1b[32m', // Green
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m', // Yellow
      DEBUG: '\x1b[36m', // Cyan
      VERBOSE: '\x1b[35m', // Magenta
    };
    return colors[level] || '\x1b[0m';
  }
}
