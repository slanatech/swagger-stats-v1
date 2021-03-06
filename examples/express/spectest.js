process.env.DEBUG = 'sws:*';

// Swagger-Stats must be intialized first thing in the app, before importing other packages
// Swagger-Stats will perform OpenTelemetry initialization

//const { registerInstrumentations } = require('@opentelemetry/instrumentation');
//const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
//const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const opentelemetry = require('@opentelemetry/api');
//const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');

const { SwsNode } = require('@swaggerstats/node');
const swsNode = new SwsNode({
  name: 'spectest-service',
});
swsNode.start();

/* This exports traces to OpenTelemetry Collector Jaeger receiver
let exporter = new JaegerExporter({
  serviceName: 'spectest',
  host: 'localhost',
  port: 14268,
  //endpoint: 'http://localhost:14268/api/traces',
});
swsMonitor.tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporter));
*/

// Set service name
//swsNode.tracerProvider.resource.attributes['service.name'] = 'spectest';

const collectorOptions = {
  url: 'grpc://collector-opentelemetry-collector.observability.svc.cluster.local:4317',
};
const exporterCollector = new OTLPTraceExporter(collectorOptions);
swsNode.tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporterCollector));
//swsNode.tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

// Can register instrumentations subsequently multiple times
//registerInstrumentations({
//  tracerProvider: swsMonitor.tracerProvider,
//  instrumentations: [ExpressInstrumentation],
//});

const http = require('http');
const debug = require('debug')('sws:spectest');

//http.globalAgent.keepAlive = true;

// Prometheus Client
const promClient = require('prom-client');
//const collectDefaultMetrics = promClient.collectDefaultMetrics;
//collectDefaultMetrics({ timeout: 1000 });

const RestOp = require('./restop');

// Server
let server = null;

// Express and middlewares
let express = require('express');
let expressBodyParser = require('body-parser');

let swaggerParser = require('swagger-parser');

let app = (module.exports = express());
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
let swaggerSpec = null;
let parser = new swaggerParser();

//let specLocation = 'petstore3.yaml';
let specLocation = 'petstore.yaml';

if (process.env.SWS_SPECTEST_URL) {
  specLocation = process.env.SWS_SPECTEST_URL;
}

let tlBucket = 60000;
if (process.env.SWS_SPECTEST_TIMEBUCKET) {
  tlBucket = parseInt(process.env.SWS_SPECTEST_TIMEBUCKET);
}

debug('Loading Swagger Spec from ' + specLocation);

parser.validate(specLocation, function (err, api) {
  if (!err) {
    debug('Success validating swagger file!');
    swaggerSpec = api;

    let swsOptions = {
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

    // Test API calls that invokes other service

    app.get('/ptest', async function (req, res) {
      let callResult = await new RestOp({ method: 'get', url: `http://sws-example-java-petclinic:9966/petclinic/api/vets` }).execute();
      debug(`Got result from downstream: ${JSON.stringify(callResult)}`);
      res.json(callResult);
    });

    app.get('/dtest', async function (req, res) {
      let otctx = opentelemetry.context.active(); // This can get current trace id
      //let otSpan = opentelemetry.getCurrentSpan(); // This does not exist anymore

      let callResult = await new RestOp({ method: 'get', url: `http://sws-example-hapi:3050/dbtest` }).execute();
      debug(`Got result from downstream 1: ${JSON.stringify(callResult)}`);

      let callResult2 = [];

      for (let i = 0; i < 10; i++) {
        let cr = await new RestOp({
          method: 'get',
          url: `http://sws-example-go:3070/v2/test`,
          headers: {
            'x-sws-res': JSON.stringify({
              code: 200,
              message: 'response from fastify',
              delay: 100,
            }),
          },
        }).execute();
        callResult2.push(cr);
      }
      debug(`Got result from downstream 2: ${JSON.stringify(callResult2)}`);

      res.json({
        result1: callResult,
        result2: callResult2,
      });

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
  let code = 500;
  let message = 'MOCK API RESPONSE';
  let delay = 0;
  let payloadsize = 0;

  // get header
  let hdrSwsRes = req.header('x-sws-res');

  if (typeof hdrSwsRes !== 'undefined') {
    let swsRes = JSON.parse(hdrSwsRes);
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
    let dummyPayload = [];
    let adjSize = payloadsize - 4;
    if (adjSize <= 0) adjSize = 1;
    let str = '';
    for (let i = 0; i < adjSize; i++) str += 'a';
    dummyPayload.push(str);
    res.status(code).json(dummyPayload);
  }
}

module.exports.app = app;
