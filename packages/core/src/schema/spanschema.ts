/*
 * Span Schema
 * Defines subset of well-known span properties and attributes,
 * with the additional information about them, such as typing
 */

// Pre-defined schema
const schemaBase = [
  // Core span properties
  { name: 'traceId', path: ['traceId'], type: 'string' },
  { name: 'spanId', path: ['spanId'], type: 'string' },
  { name: 'parentSpanId', path: ['parentSpanId'], type: 'string' },
  { name: 'name', path: ['name'], type: 'string' },
  { name: 'kind', path: ['kind'], type: 'string' },
  { name: 'service', path: ['service'], type: 'string' },
  { name: 'category', path: ['category'], type: 'string' },
  { name: 'success', path: ['success'], type: 'boolean' },
  { name: 'startTime', path: ['startTime'], type: 'datetime' },
  { name: 'endTime', path: ['endTime'], type: 'datetime' },
  { name: 'duration', path: ['duration'], type: 'integer' },

  // HTTP instrumentation-specific attributes
  { name: 'http.method', path: ['attributes', 'http.method'], type: 'string' },
  { name: 'http.url', path: ['attributes', 'http.url'], type: 'string' },
  { name: 'http.status_code', path: ['attributes', 'http.status_code'], type: 'integer' },
  { name: 'http.route', path: ['attributes', 'http.route'], type: 'string' },

  // Express instrumentation-specific attributes
  { name: 'express.type', path: ['attributes', 'express.type'], type: 'string' },
  { name: 'express.name', path: ['attributes', 'express.name'], type: 'string' },

  // TODO add more instrumentation-specific attributes here
];

/*
  public hasChild: boolean; // will be set to true upon trace completion if this span has child span(s)
  public depth: number | null;
  public status: any | null;

  public success: boolean;
  public attributes: any;
  public resourceAttributes: any;
  public instrumentationLibrary: string | null;

* */

class SpanSchema {
  public schemaData: any;

  constructor() {
    // Schema is initialized with base data, and then can be extended as needed, i.e. with service-specific attributes
    this.schemaData = schemaBase;
  }

  // TODO Implement methods to extend schema with custom data

  // Generates schema that can be used with perspective
  toPerspectiveSchema(): any {
    const result: any = {};
    this.schemaData.map((x: any) => {
      const key: string = x.name;
      result[key] = x.type;
    });
    return result;
  }
}

const spanSchema = new SpanSchema();
export { spanSchema };
