/*
 * Test database
 **/

const DbOp = require('./dbop');
const logger = require('../logger')('DB');

// pg-promise initialization options
const pgp_options = {
  /*
  connect: function(client, dc, useCount) {},
  disconnect: function(client, dc) {},
  query: function(e) {},
  receive: function(data, result, e) {},
*/
  capSQL: true,
  error: function (err, e) {
    logger.error(`Database error: ${JSON.stringify(err)}`);
  },
};

const pgp = require('pg-promise')(pgp_options);

// Database Access (Postgres)
class TestDB {
  constructor(database) {
    this.database = database;
    this.initialized = false;
    this.statements = {};
  }

  async initialize() {
    let connectionOptions = Object.assign(
      {
        poolSize: 3,
        poolIdleTimeout: 10000,
      },
      this.database
    );
    this.client = pgp(connectionOptions);
    this.prepareStatements();
  }

  prepareStatements() {
    this.statements.getCount = new pgp.PreparedStatement({ name: 'getCount', text: 'SELECT count(*) FROM pg_stat_user_tables' });

    // log all the generated statements
    for (let stmt in this.statements) logger.info(`Prepared statement '${this.statements[stmt].name}': ${this.statements[stmt].text}`);
  }

  async getCount() {
    // return new DbOp(this.client.result(this.statements.getCount)).execute();
    return new DbOp(this.client.oneOrNone(this.statements.getCount)).execute();
  }

  formatError(e) {
    return e.message ? e.message : JSON.stringify(e);
  }
}

module.exports = TestDB;
