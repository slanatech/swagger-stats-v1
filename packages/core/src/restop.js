/* Generalized REST API Operation
   Extends OpResult, so all OpResult facilities can be used
 */

// TODO To use in frontend - keep require ? change to import ? Remove logging ?
const axios = require('axios');
const { OpResult } = require('./opresult');
const { pathOr } = require('ramda');

// TODO How to do logging for both backend and frontend ?

// @ts-ignore
class RestOp extends OpResult {
  constructor(options = {}) {
    super(false, '', null);
    this.options = options;
    this.code = 0;
    this.complete = false;
    this.duration = 0;
  }

  execute() {
    let apiop = this;
    return new Promise(function (resolve) {
      let startTs = Date.now();
      axios(apiop.options)
        .then(function (response) {
          apiop.success = true;
          apiop.code = pathOr(0, ['status'], response);
          apiop.data = pathOr(null, ['data'], response);
          apiop.message = '';
          //logger.debug(`${apiop.options.method.toUpperCase()} ${apiop.options.url} ${apiop.code}`);
        })
        .catch(function (error) {
          apiop.success = false;
          apiop.code = pathOr(-1, ['response', 'status'], error);
          apiop.message = pathOr(error.message, ['response', 'statusText'], error);
          apiop.data = pathOr(null, ['response', 'data'], error);
          //logger.error(`${apiop.options.method.toUpperCase()} ${apiop.options.url} ${apiop.code} "${apiop.message}"`);
        })
        .finally(() => {
          apiop.complete = true;
          apiop.duration = Date.now() - startTs;
          resolve(apiop);
        });
    });
  }

  isComplete() {
    return this.complete;
  }
}

module.exports = RestOp;
