const winston = require('winston'),
  error = require('./error'),
  {
    IN_DEV
  } = require('../../config')
const { createLogger, format, transports } = winston


const logDir = IN_DEV ? './logs' : '/var/log/nodejs'
const logFileOpts = {
  handleExceptions: true,
  filename: `${logDir}/${(new Date()).toISOString()}.winston.log`
}

const level = process.env.LOG_LEVEL || (IN_DEV ? 'debug' : 'info')

const dev = format.combine(
  format.colorize(),
  format.timestamp(),
  format.prettyPrint(),
  format.align(),
  format.splat(),
  format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
)

const prod = format.combine(
  format.timestamp(),
  format.align(),
  format.json(),
  format.splat()
)

const logger = createLogger({
  level: level,
  exitOnError: false,
  format: IN_DEV ? dev : prod,
  transports: [
    new transports.Console({ handleExceptions: true }),
    new transports.File(logFileOpts)
  ]
})

// Errors are already handled
logger.emitErrs = false

// Override std consoles
console.log = function () {
  logger.debug.apply(logger, arguments)
}
console.debug = function () {
  logger.debug.apply(logger, arguments)
}
console.info = function () {
  logger.info.apply(logger, arguments)
}
console.warn = function (warning) {
  if (!warning) return
  logger.warn.apply(logger, arguments)
}
console.error = function (err) {
  if (!err) return
  logger.error.apply(logger, arguments)
  error.handle(err)
}

winston.add(logger)
module.exports = logger