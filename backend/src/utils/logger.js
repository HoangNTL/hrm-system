import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf, errors, colorize } = format;

// format log
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat,
  ),
  transports: [
    new transports.Console({
      format: combine(colorize({ all: true })),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // log error to file
    new transports.File({ filename: 'logs/combined.log' }), // log all to file
  ],
  exitOnError: false,
});

export default logger;
