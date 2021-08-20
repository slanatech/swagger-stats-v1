/*
 * swagger-stats utilities
 */

// Return response status code class
export function getStatusCodeClass(code: number): string {
  if (code < 200) return 'info';
  if (code < 300) return 'success';
  if (code < 400) return 'redirect';
  if (code < 500) return 'client_error';
  return 'server_error';
}

export function isError(code: number): boolean {
  return code >= 400;
}

// Supported Stat Fields with masks
export const swsStatFields = {
  method: 1,
  timeline: 1 << 1,
  lasterrors: 1 << 2,
  longestreq: 1 << 3,
  apidefs: 1 << 4,
  apistats: 1 << 5,
  apiop: 1 << 6,
  errors: 1 << 7,
  all: parseInt('11111111', 2),
  '*': parseInt('11111111', 2),
};

// Supported properties in Swagger Parameter object
module.exports.swsParameterProperties = {
  name: 'name',
  in: 'in',
  description: 'description',
  required: 'required',
  /*schema          : "schema",*/ // We will not be copying schema for "body" parameters
  type: 'type',
  format: 'format',
  allowEmptyValue: 'allowEmptyValue',
  items: 'items', // ????
  collectionFormat: 'collectionFormat',
  default: 'default',
  maximum: 'maximum',
  exclusiveMaximum: 'exclusiveMaximum',
  minimum: 'minimum',
  exclusiveMinimum: 'exclusiveMinimum',
  maxLength: 'maxLength',
  minLength: 'minLength',
  pattern: 'pattern',
  maxItems: 'maxItems',
  minItems: 'minItems',
  uniqueItems: 'uniqueItems',
  enum: 'enum',
  multipleOf: 'multipleOf',
};

// returns string value of argument, depending on typeof
module.exports.swsStringValue = function (val: any) {
  switch (typeof val) {
    case 'string':
      return val;
    case 'boolean':
    case 'number':
      return val.toString();
    case 'object':
      if (val === null) return '';
      let res = '';
      try {
        res = JSON.stringify(val);
      } catch (e) {
        res = '';
      }
      return res;
  }
  return '';
};

// returns object key values as string
module.exports.swsStringRecursive = function (output: any, val: any) {
  if (typeof val === 'object' && !Array.isArray(val)) {
    for (const key in val) {
      output[key] = this.swsStringValue(val[key]);
    }
  } else {
    output = this.swsStringValue(val);
  }
  return output;
};

// recursively cast properties of nested objects to strings
module.exports.swsCastStringR = function (val: any) {
  switch (typeof val) {
    case 'string':
      return val;
    case 'boolean':
    case 'number':
      return val.toString();
    case 'object':
      const casted = {};
      for (const prop in val) {
        // @ts-ignore
        casted[prop] = module.exports.swsCastStringR(val[prop]);
      }
      return casted;
  }
  return '';
};

// returns string value of argument, depending on typeof
module.exports.swsNumValue = function (val: string) {
  const res = Number(val);
  return Number.isNaN(res) ? 0 : res;
};

// Calculate CPU Usage Percentage
module.exports.swsCPUUsagePct = function (starthrtime: [number, number], startusage: any) {
  // On CPU - see
  // https://github.com/nodejs/node/pull/6157
  const elapTime = process.hrtime(starthrtime);
  const NS_PER_SEC = 1e9;
  const elapsedns = elapTime[0] * NS_PER_SEC + elapTime[1]; // nanoseconds
  const elapsedmcs = elapsedns / 1000; // microseconds
  const elapUsage = process.cpuUsage(startusage); // microseconds
  const cpuPercent = (100 * (elapUsage.user + elapUsage.system)) / elapsedmcs;
  return cpuPercent;
};
