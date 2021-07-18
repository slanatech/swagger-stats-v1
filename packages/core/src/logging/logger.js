/*
 * Logger using Pino (to be used in backend)
 */

// TODO How to do logging for both backend and frontend ?

const pino = require('pino');

/*
let logLevel = process.env.LOG_LEVEL || 'debug';
const fs = require('fs-extra');
const path = require('path');
const logPath = path.join(__dirname, '..', '..', '..', 'log');
fs.ensureDirSync(logPath);
*/

function getLevel(){
  if(process) {
    return process.env.LOG_LEVEL || 'debug';
  }else{
    return 'debug';
  }
}

const logger = pino({
  level: getLevel()
});

global['logger'] = logger;

function getLogger(mod) {
  if (typeof mod === 'undefined' || !mod) {
    return logger;
  }
  return logger.child({ mod: mod });
}

module.exports = getLogger;
