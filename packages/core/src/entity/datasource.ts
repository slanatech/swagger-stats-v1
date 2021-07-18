/*
 * Datasource
 */
const { v4: uuidv4 } = require('uuid');

// Datasource
export class DataSource {
  public readonly id: string;
  public name: string;
  public type: string;
  public description: string;

  public settings: Record<string, any> = {};
  public capabilities: Record<string, boolean> = {};

  constructor(src: any) {
    // Common properties
    this.id = uuidv4();
    this.name = '';
    this.type = 'prometheus';
    this.description = '';

    // Settings, may be specific per DS type
    this.settings = {
      url: null,
      username: null,
      password: null,
    };

    // Capabilities, depending on DS type
    this.capabilities = {
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
