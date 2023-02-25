const config = require('./config');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, prettyPrint } = format;
const logger = createLogger({
    format: combine(
      timestamp(),
      prettyPrint(),
    ),
    transports: [
      new transports.Console(({
        level: config.logLevel || 'info',
        timestamp: timestamp()
      })),
      new transports.File({ filename: 'server.log' })
    ]
  });

module.exports = logger;
