/*
 * SWS Core Modules
 */

const { OpResult, OpSuccess, OpError, isSuccess } = require('./src/opresult');
const RestOp = require('./src/restop');
const IPlugin = require('./src/interface/iplugin');
const DataSource = require('./src/entity/datasource');
const getLogger = require('./src/logging/logger');
const prometheusTransforms = require('./src/transforms/prometheustransforms');
const dateTimeUtils = require('./src/utils/datetimeutils');

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
};
