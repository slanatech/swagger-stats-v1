/* DB Operation */

const { pathOr } = require('ramda');
const { OpResult } = require('../opresult');
const logger = require('../logger')('DBOP');

class DbOp extends OpResult {
  constructor(dbopPromise) {
    super(false, '', null);
    this.dbopPromise = dbopPromise;
    this.success = false;
    this.message = '';
    this.rowCount = 0;
    this.rows = [];
    this.fields = [];
    this.value = null;
  }

  async execute() {
    let result = null;
    try {
      result = await this.dbopPromise;
      this.success = true;
      this.rowCount = pathOr(0, ['rowCount'], result);
      this.rows = pathOr([], ['rows'], result);
      this.fields = pathOr([], ['fields'], result);
      this.value = pathOr(null, ['value'], result);
      this.data = result;
    } catch (e) {
      this.success = false;
      this.message = e.message;
      logger.error(`Database error: ${e.message}`);
    }
    return this;
  }
}

module.exports = DbOp;
