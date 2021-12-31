//export * from './prometheus';
/*
export * from './opresult';
export * from './restop';
export * from './interface/iplugin';
export * from './entity/datasource';
export * from './logging/logger';
export * from './transforms/prometheustransforms';
export * from './utils/datetimeutils';
*/

import { DataSource } from './entity/datasource';
import { SwsSpan } from './entity/swsspan';
import spanTransforms from './transforms/spantransforms';
//export * from './transforms/spantransforms';
export * from './entity/swsspan';

/*
import { OpResult, OpSuccess, OpError, isSuccess } from './opresult.js';
const RestOp = require('./restop');
const IPlugin = require('./interface/iplugin');
const getLogger = require('./logging/logger');
const prometheusTransforms = require('./transforms/prometheustransforms');
const dateTimeUtils = require('./utils/datetimeutils');
*/

module.exports = {
  /*
  OpResult,
  OpSuccess,
  OpError,
  isSuccess,
  RestOp,
  IPlugin,
  DataSource,
  getLogger,
  prometheusTransforms,
  dateTimeUtils,
 */
  DataSource,
  SwsSpan,
  spanTransforms,
};
