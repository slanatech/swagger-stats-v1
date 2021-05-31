/**
 * Logging using Pino
 */

const pino = require('pino');
const { pathOr } = require('ramda');

const logLevel = pathOr('debug', ['env', 'LOG_LEVEL'], process);

function getLevel() {
  return logLevel;
}

//const isoTime = () => `,"time":"${new Date(Date.now()).toISOString()}"`;
let loggerOptions = {
  level: getLevel(),
};

if ('LOG_PRETTY' in process.env) {
  loggerOptions.prettyPrint = { colorize: true, translateTime: true };
}

const logger = pino(loggerOptions);

global['logger'] = logger;

function getLogger(mod) {
  if (typeof mod === 'undefined' || !mod) {
    return logger;
  }
  return logger.child({ mod: mod, level: getLevel() });
}

module.exports = getLogger;
