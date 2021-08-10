/**
 Standard UStack Plugin interface

 All Plugins must implement this interface

 Plugin must provide a response to all requests as OpResult object
 {
    success: {true|false}
    message: <Error message, if any>
    data: <response data, optional>
 }
*/

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { OpError } = require('../opresult');

// @ts-ignore
class IPlugin {
  // Register data soource
  async registerDataSource(ds) {
    return new OpError('Not implemented');
  }

  // Test data soource
  async testDataSource(ds) {
    return new OpError('Not implemented');
  }

  // TODO Add resolved datasource
  // Execute arbitrary plugin-specific request
  async request(payload) {
    return new OpError('Not implemented');
  }

  // TODO Add resolved datasource, and Context (optional)
  // Execute Query
  async query(payload) {
    return new OpError('Not implemented');
  }
}

module.exports = IPlugin;

// entity
