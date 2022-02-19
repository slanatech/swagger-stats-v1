/*
 * Logger using Pino (to be used in backend)
 */

import Pino from 'pino';

/*
let logLevel = process.env.LOG_LEVEL || 'debug';
const fs = require('fs-extra');
const path = require('path');
const logPath = path.join(__dirname, '..', '..', '..', 'log');
fs.ensureDirSync(logPath);
*/

export function getLevel() {
  if (typeof process !== 'undefined' && process && process.env) {
    return process.env.LOG_LEVEL || 'debug';
  } else {
    return 'debug';
  }
}

const logger = Pino({
  level: getLevel(),
});

//global['logger'] = logger;

export function getLogger(mod: string | null = null) {
  if (!mod) {
    return logger;
  }
  return logger.child({ mod: mod });
}
