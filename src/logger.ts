import { createLogger, transports, format } from 'winston';

type LogLevel = 'info' | 'warning' | 'error' | 'success';
type LoggerFunction = (message: string, level?: LogLevel) => void;

const customLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, stack }) => {
      const colors: { [key: string]: string } = {
        info: '\x1b[34m',
        warning: '\x1b[33m',
        error: '\x1b[31m',
        success: '\x1b[32m',
        default: '\x1b[0m',
      };
      const color = colors[level] || colors.default;
      const formattedLevel =
        level === 'success' ? 'SUCCESS' : level.toUpperCase();
      const formattedStack = stack ? `\nStack:\n${stack}` : '';
      return `[${timestamp}] ${color}[${formattedLevel}]${colors.default} ${message} ${formattedStack}`;
    }),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' }),
  ],
});

export const logger: LoggerFunction = (message, level) => {
  const stackInfo = new Error().stack?.split('\n').slice(2).join('\n');
  switch (level) {
    case 'info':
      customLogger.info(message);
      break;
    case 'warning':
      customLogger.warn(message);
      break;
    case 'error':
      customLogger.error(message, { stack: stackInfo });
      break;
    case 'success':
      customLogger.info(message, { level: 'success' });
      break;
    default:
      customLogger.info(message);
  }
};
