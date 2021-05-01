// Swagger-Stats must be intialized first thing in the app, before importing other packages
// Swagger-Stats will perform OpenTelemetry initialization
//const { registerInstrumentations } = require('@opentelemetry/instrumentation');
//const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
//const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const opentelemetry = require('@opentelemetry/api');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing');

// opa2

const { swsMonitor } = require('@swaggerstats/node');
swsMonitor.start({});
const tracer = opentelemetry.trace.getTracer('spectest');

/* This exports traces to OpenTelemetry Collector Jaeger receiver
let exporter = new JaegerExporter({
  serviceName: 'spectest',
  host: 'localhost',
  port: 14268,
  endpoint: 'http://localhost:14268/api/traces',
});
swsMonitor.tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporter));
*/

/* This exports traces via OpenTelemetry protocol to specified destination */
const collectorOptions = {
  serviceName: 'spectest',
  url: 'localhost:50051', // url is optional and can be omitted - default is localhost:4317
};
const exporterCollector = new CollectorTraceExporter(collectorOptions);
swsMonitor.tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporterCollector));
swsMonitor.tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

// Can register instrumentations subsequently multiple times
//registerInstrumentations({
//  tracerProvider: swsMonitor.tracerProvider,
//  instrumentations: [ExpressInstrumentation],
//});

const http = require('http');
const path = require('path');
const debug = require('debug')('sws:spectest');

//http.globalAgent.keepAlive = true;

// Prometheus Client
const promClient = require('prom-client');
const collectDefaultMetrics = promClient.collectDefaultMetrics;
// Probe every 1 second
collectDefaultMetrics({ timeout: 1000 });

const RestOp = require('./restop');

// Server
var server = null;

// Express and middlewares
var express = require('express');
var expressBodyParser = require('body-parser');

var swaggerParser = require('swagger-parser');

var swStats = require('@swaggerstats/node'); // require('swagger-stats');

var app = (module.exports = express());
app.use(expressBodyParser.json());
app.use(expressBodyParser.urlencoded({ extended: true }));

// JSON formatting
app.set('json spaces', 2);
app.set('json replacer', null);

// all environments
app.set('port', process.env.PORT || 3040);

// Suppress cache on the GET API responses
app.disable('etag');

app.get('/', function (req, res) {
  res.redirect('/swagger-stats/');
});

// Return Prometheus metrics from prom-client
app.get('/metrics', function (req, res) {
  res.status(200).set('Content-Type', 'text/plain');
  Promise.resolve(promClient.register.metrics()).then((x) => {
    res.end(x);
  });
});

// Testing validation of 3rd-party API spec
var swaggerSpec = null;
var parser = new swaggerParser();

//var specLocation = 'petstore3.yaml';
var specLocation = 'petstore.yaml';

if (process.env.SWS_SPECTEST_URL) {
  specLocation = process.env.SWS_SPECTEST_URL;
}

var tlBucket = 60000;
if (process.env.SWS_SPECTEST_TIMEBUCKET) {
  tlBucket = parseInt(process.env.SWS_SPECTEST_TIMEBUCKET);
}

debug('Loading Swagger Spec from ' + specLocation);

parser.validate(specLocation, function (err, api) {
  if (!err) {
    debug('Success validating swagger file!');
    swaggerSpec = api;

    var swsOptions = {
      name: 'swagger-stats-spectest',
      version: '0.95.19',
      hostname: 'hostname',
      ip: '127.0.0.1',
      timelineBucketDuration: tlBucket,
      swaggerSpec: swaggerSpec,
      //basePath: '/api',
      uriPath: '/swagger-stats',
      durationBuckets: [10, 25, 50, 100, 200],
      requestSizeBuckets: [10, 25, 50, 100, 200],
      responseSizeBuckets: [10, 25, 50, 100, 200],
      apdexThreshold: 25,
    };

    // Test API call that invokes other service
    app.get('/dtest', async function (req, res) {
      let otctx = opentelemetry.context.active(); // This can get current trace id
      //let otSpan = opentelemetry.getCurrentSpan(); // This does not exist anymore

      let callResult = await new RestOp({ method: 'get', url: `http://localhost:3052/v2/paramstest/200/and/aaa` }).execute();
      debug(`Got result from downstream: ${JSON.stringify(callResult)}`);
      res.json(callResult);

      /*
      const span = tracer.startSpan('makeRequest');
      await opentelemetry.context.with(opentelemetry.setSpan(opentelemetry.context.active(), span), async () => {
        let callResult = await new RestOp({ method: 'get', url: `http://localhost:3050/v2/paramstest/200/and/aaa` }).execute();
        debug(`Got result from downstream: ${JSON.stringify(callResult)}`);
        span.end();
        res.json(callResult);
      });
      */
    });

    // Implement mock API
    app.use(mockApiImplementation);

    // Setup server
    server = http.createServer(app);
    server.listen(app.get('port'));
    server.keepAliveTimeout = 61 * 1000;
    server.headersTimeout = 65 * 1000;
    debug('Server started on port ' + app.get('port') + ' http://localhost:' + app.get('port'));
  }
});

// Mock implementation of any API request
// Supports the following parameters in x-sws-res header:
// x-sws-res={ code:<response code>,
//             message:<message to provide in response>,
//             delay:<delay to respond>,
//             payloadsize:<size of payload JSON to generate>
//           }
function mockApiImplementation(req, res, next) {
  var code = 500;
  var message = 'MOCK API RESPONSE';
  var delay = 0;
  var payloadsize = 0;

  // get header
  var hdrSwsRes = req.header('x-sws-res');

  if (typeof hdrSwsRes !== 'undefined') {
    var swsRes = JSON.parse(hdrSwsRes);
    if ('code' in swsRes) code = swsRes.code;
    if ('message' in swsRes) message = swsRes.message;
    if ('delay' in swsRes) delay = swsRes.delay;
    if ('payloadsize' in swsRes) payloadsize = swsRes.payloadsize;
  }

  if (delay > 0) {
    setTimeout(function () {
      mockApiSendResponse(res, code, message, payloadsize);
    }, delay);
  } else {
    mockApiSendResponse(res, code, message, payloadsize);
  }
}

function mockApiSendResponse(res, code, message, payloadsize) {
  if (payloadsize <= 0) {
    res.status(code).send(message);
  } else {
    // generate dummy payload of approximate size
    var dummyPayload = [];
    var adjSize = payloadsize - 4;
    if (adjSize <= 0) adjSize = 1;
    var str = '';
    for (var i = 0; i < adjSize; i++) str += 'a';
    dummyPayload.push(str);
    res.status(code).json(dummyPayload);
  }
}

module.exports.app = app;
