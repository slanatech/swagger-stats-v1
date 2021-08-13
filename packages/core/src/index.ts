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
export * from './entity/swsspan';

const { OpResult, OpSuccess, OpError, isSuccess } = require('./opresult');
const RestOp = require('./restop');
const IPlugin = require('./interface/iplugin');
const getLogger = require('./logging/logger');
const prometheusTransforms = require('./transforms/prometheustransforms');
const dateTimeUtils = require('./utils/datetimeutils');

module.exports = {
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
  SwsSpan,
};
