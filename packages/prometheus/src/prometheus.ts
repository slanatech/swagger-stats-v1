const { pathOr } = require('ramda');
const { OpResult, OpError, RestOp, DataSource, getLogger } = require('@swaggerstats/core');
const logger = getLogger('PROMETHEUS');
const qs = require('qs');

const PLUGIN_NAME = 'prometheus';

export class Prometheus {
  private _datasources: any;

  constructor() {
    this._datasources = {}; // All registered datasources
  }

  async init() {
    logger.info('Prometheus initialized');
    return true;
  }

  // IPlugin Interface Implementation //////////////////////////////////////// //

  // Register data source
  async registerDataSource(ds: any = {}) {
    let opResult = new OpResult();

    if (!this.validateDataSource(ds).isSuccess(opResult)) {
      return opResult;
    }

    // Just store datasource
    this._datasources[ds.id] = ds;

    logger.info(`DataSource registered successfully: ${JSON.stringify(ds)}`);

    return opResult.ok();
  }

  // Test data source
  async testDataSource(ds: any = {}) {
    let opResult = new OpResult();

    if (!this.validateDataSource(ds).isSuccess(opResult)) {
      return opResult;
    }

    // Test data source by getting build info
    let reqOptions = this.getRequestOptions(ds, 'get', '/api/v1/query', {
      params: {
        query: 'prometheus_build_info',
      },
    });

    let reqResult = await new RestOp(reqOptions).execute();
    if (!reqResult.isSuccess(opResult)) {
      logger.error(`Test failed for datasource ${JSON.stringify(ds)}`);
      return opResult;
    }

    return opResult;
  }

  // Execute arbitrary plugin-specific request
  async request(payload: any = {}) {
    let opResult = new OpResult();

    let op = pathOr(null, ['op'], payload);
    if (!op) {
      return opResult.error('Missing plugin operation');
    }

    switch (op) {
      case 'labels': {
        return this.getMeta(payload, '/api/v1/labels');
      }
      case 'metrics': {
        return this.getMeta(payload, '/api/v1/label/__name__/values');
      }
      case 'labelvalues': {
        return this.getLabelValues(payload);
      }
      case 'series': {
        return this.getSeries(payload);
      }
    }
    return opResult.error(`Invalid operation ${op}`);
  }

  // Execute Query
  async query(payload: any = {}) {
    return this.executeQuery(payload);
  }

  // ///////////////////////////////////////////////////////// //

  // Get labels, or label values
  async getMeta(payload: any = {}, path: any = {}) {
    let opResult = new OpResult();

    // need ds
    let dsid = pathOr(null, ['ds'], payload);
    if (!dsid) {
      return opResult.error('Missing datasource id');
    }

    let ds = this._datasources[dsid] || null;
    if (!ds) {
      return opResult.error(`Datasource ${dsid} not found`);
    }

    // Get labels
    let reqOptions = this.getRequestOptions(ds, 'get', path);

    let reqResult = await new RestOp(reqOptions).execute();

    if (!reqResult.isSuccess(opResult)) {
      logger.error(`Failed to get ${path} for DS=${ds.id}, error: ${opResult.message}`);
      return opResult;
    }

    if (pathOr('fail', ['data', 'status'], reqResult) !== 'success') {
      return opResult.error('Response status is not success');
    }

    let responseData = pathOr([], ['data', 'data'], reqResult);

    return opResult.ok(responseData);
  }

  // Get values for specific label
  getLabelValues(payload: any = {}) {
    // need label name
    let label = pathOr(null, ['label'], payload);
    if (!label) {
      return new OpError('Missing label name');
    }

    return this.getMeta(payload, `/api/v1/label/${label}/values`);
  }

  // Get series
  async getSeries(payload: any = {}) {
    let opResult = new OpResult();

    // need ds
    let dsid = pathOr(null, ['ds'], payload);
    if (!dsid) {
      return opResult.error('Missing datasource id');
    }

    let ds = this._datasources[dsid] || null;
    if (!ds) {
      return opResult.error(`Datasource ${dsid} not found`);
    }

    // TODO Make params extraction simpler - i.e. validateParams(['match','start','end'...])

    // need match
    let match = pathOr(null, ['match'], payload);
    if (!match) {
      return opResult.error('Missing parameter match');
    }

    let start = pathOr(null, ['start'], payload);
    if (!start) {
      return opResult.error('Missing parameter start');
    }

    let end = pathOr(null, ['end'], payload);
    if (!end) {
      return opResult.error('Missing parameter end');
    }

    // Get series
    let reqOptions = this.getRequestOptions(ds, 'post', '/api/v1/series');
    reqOptions.data = qs.stringify(
      {
        match: match,
        start: start,
        end: end,
      },
      { arrayFormat: 'brackets' }
    );
    reqOptions.headers = { 'content-type': 'application/x-www-form-urlencoded' };

    let reqResult = await new RestOp(reqOptions).execute();

    if (!reqResult.isSuccess(opResult)) {
      logger.error(`Failed to get series for DS=${ds.id}, error: ${opResult.message}`);
      return opResult;
    }

    if (pathOr('fail', ['data', 'status'], reqResult) !== 'success') {
      return opResult.error('Response status is not success');
    }

    let responseData = pathOr([], ['data', 'data'], reqResult);

    return opResult.ok(responseData);
  }

  // Execute query
  async executeQuery(payload: any = {}) {
    let opResult = new OpResult();

    // need ds
    let dsid = pathOr(null, ['ds'], payload);
    if (!dsid) {
      return opResult.error('Missing datasource id');
    }

    let ds = this._datasources[dsid] || null;
    if (!ds) {
      return opResult.error(`Datasource ${dsid} not found`);
    }

    // TODO Make params extraction simpler - i.e. validateParams(['match','start','end'...])

    let query = pathOr(null, ['query'], payload);
    if (!query) {
      return opResult.error('Missing query');
    }

    // start, end, step are optional. If they are not specified, it will be instant query: /api/v1/query
    // if they are specified, it will be range query: /api/v1/query_range
    let start = pathOr(null, ['start'], payload);
    let end = pathOr(null, ['end'], payload);
    let step = pathOr(null, ['step'], payload);
    let time = pathOr(null, ['time'], payload);

    let isRangeQuery = start !== null && end !== null && step !== null;
    let reqPath = isRangeQuery ? '/api/v1/query_range' : '/api/v1/query';

    let reqParams: Record<string,any> = {};
    reqParams = isRangeQuery ? { query: query, start: start, end: end, step: step } : { query: query };
    if (!isRangeQuery && time) {
      reqParams.time = time;
    }

    let reqOptions = this.getRequestOptions(ds, 'post', reqPath, {
      data: qs.stringify(reqParams, { arrayFormat: 'brackets' }),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });

    let reqResult = await new RestOp(reqOptions).execute();

    if (!reqResult.isSuccess(opResult)) {
      logger.error(`Failed to execute query ${query} for DS=${ds.id}, error: ${opResult.message}`);
      return opResult;
    }

    if (pathOr('fail', ['data', 'status'], reqResult) !== 'success') {
      return opResult.error('Response status is not success');
    }

    let responseData = pathOr([], ['data', 'data'], reqResult);

    return opResult.ok(responseData);
  }

  validateDataSource(ds: any = {}) {
    let opResult = new OpResult();

    if (!(ds instanceof DataSource)) {
      return opResult.error('Invalid datasource');
    }

    if (pathOr(null, ['type'], ds) !== PLUGIN_NAME) {
      return opResult.error('Invalid datasource type');
    }

    let settings = pathOr(null, ['settings'], ds);
    if (!settings) {
      return opResult.error('Missing settings');
    }

    let url = pathOr(null, ['url'], settings);
    if (!url) {
      return opResult.error('Missing URL');
    }

    return opResult.ok();
  }

  // Get base API request options for invoking Prometheus API
  getRequestOptions(ds: any = {}, method:string = "", path:string = "", props: any = {}) {
    let options = Object.assign(
      {
        method: method,
        url: ds.settings.url + path,
      },
      props
    );
    // TODO Suppot Auth
    // TODO Support any additional headers as needed
    return options;
  }

}

module.exports = Prometheus;
