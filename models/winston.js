var appRoot = require('app-root-path');
var  winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

var options = {
    file: {
      filename: `${appRoot}/logs/app.log`,
      format: combine(
        label({ label: 'Proyecto chatbotDora - Comandato' }),
        timestamp(),
        prettyPrint()
      ),
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 100,
      colorize: false,
    },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
  };

 

  let logger = winston.createLogger({
    transports: [
      new (winston.transports.Console)(options.console),
      //new (winston.transports.File)(options.errorFile),
      new (winston.transports.File)(options.file)
    ],
    exitOnError: false, // do not exit on handled exceptions
  });

  logger.stream = {
    write: function(message, encoding) {
      logger.info(message);
    },
  };

module.exports = logger;