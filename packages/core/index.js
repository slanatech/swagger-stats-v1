/*
 * SWS Core Modules
 */

const { OpResult, OpSuccess, OpError, isSuccess } = require('./main/opresult');
const RestOp = require('./main/restop');
const IPlugin = require('./main/interface/iplugin');
const DataSource = require('./main/entity/datasource');
const getLogger = require('./main/logging/logger');
const prometheusTransforms = require('./main/transforms/prometheustransforms');
const dateTimeUtils = require('./main/utils/datetimeutils');

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
