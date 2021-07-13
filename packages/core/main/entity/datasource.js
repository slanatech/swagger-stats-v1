/*
 * Datasource
 */
const { v4: uuidv4 } = require('uuid');

// Datasource
class DataSource {
  constructor(src) {
    // Common properties
    this.id = uuidv4();
    this.name = null;
    this.type = 'prometheus';
    this.description = null;

    // Settings, may be specific per DS type
    this.settings = {
      url: null,
      username: null,
      password: null,
    };

    // Capabilities, depending on DS type
    this.capabilities = {
      // TODO
      timeseries: false,
      aggregation: false,
    };

    // Construction //
    if (typeof src !== 'undefined' && src) {
      Object.assign(this, src);
    }
  }

  // TODO Methods
}

module.exports = DataSource;
