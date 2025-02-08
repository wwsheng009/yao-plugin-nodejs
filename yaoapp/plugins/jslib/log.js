const winston = require("winston");

// Create a Winston logger that writes log entries to a file
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [new winston.transports.File({ filename: "./logs/jslib.log" })],
});
module.exports = {
  logger,
};

// Example usage of the logger
// logger.info("This is an informational message");
