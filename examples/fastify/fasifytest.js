//const { registerInstrumentations } = require('@opentelemetry/instrumentation');
//const { PgInstrumentation } = require('@opentelemetry/instrumentation-pg');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing');

const { swsMonitor } = require('@swaggerstats/node');
swsMonitor.start({});

// Set service name
swsMonitor.tracerProvider.resource.attributes['service.name'] = 'fastifytest';

/* This exports traces via OpenTelemetry protocol to specified destination */
const collectorOptions = {
  url: 'grpc://localhost:4327', // url is optional and can be omitted - default is localhost:4317
};
const exporterCollector = new CollectorTraceExporter(collectorOptions);
swsMonitor.tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporterCollector));
swsMonitor.tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

// Can register instrumentations subsequently multiple times after init
//registerInstrumentations({
//    tracerProvider: swsMonitor.tracerProvider,
//    instrumentations: [new PgInstrumentation()],
//});

// ///////////////////////////////////////////// //

const http = require('http');
// Require the framework and instantiate it
const fastify = require('fastify')({
  logger: { level: 'info' },
});

//const swStats = require('../../lib'); // require('swagger-stats');
//const swaggerSpec = require('./petstore.json');

let server = null;

fastify.get('/v2/paramstest/:code/and/:value', function (request, reply) {
  testerImpl(request, reply);
});

fastify.get('/stop', function (request, reply) {
  process.exit(0);
});

fastify.route({
  method: ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'],
  url: '/v2/*',
  handler: async function (request, reply) {
    await mockApiImplementation(request, reply);
  },
});

fastify.route({
  method: ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'],
  url: '/pet*',
  handler: async function (request, reply) {
    await mockApiImplementation(request, reply);
  },
});

// Run the server
fastify.listen(3070, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});

function waitfor(t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t);
  });
}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

function stopApp() {
  console.log('stopping hapi server');
  server.stop({ timeout: 1000 }).then(function (err) {
    console.log('hapi server stopped');
    process.exit(0);
  });
}

async function mockApiImplementation(request, reply) {
  let code = 500;
  let message = 'MOCK API RESPONSE';
  let delay = 0;
  let payloadsize = 0;

  if (request.raw.url.startsWith('/v2/success')) {
    return reply.code(200).send('OK');
  }
  if (request.raw.url.startsWith('/v2/redirect')) {
    return reply.redirect('/v2/success');
  }
  if (request.raw.url.startsWith('/v2/client_error')) {
    return reply.code(404).send('Not found');
  }
  if (request.raw.url.startsWith('/v2/server_error')) {
    return reply.code(500).send('Server Error');
  }

  // get header
  let hdrSwsRes = request.headers['x-sws-res'];

  if (typeof hdrSwsRes !== 'undefined') {
    var swsRes = JSON.parse(hdrSwsRes);
    if ('code' in swsRes) code = parseInt(swsRes.code);
    if ('message' in swsRes) message = swsRes.message;
    if ('delay' in swsRes) delay = swsRes.delay;
    if ('payloadsize' in swsRes) payloadsize = swsRes.payloadsize;
  }

  if (delay > 0) {
    await waitfor(delay);
  }

  return mockApiSendResponse(request, reply, code, message, payloadsize);
}

function mockApiSendResponse(request, reply, code, message, payloadsize) {
  if (payloadsize <= 0) {
    reply.code(code).send(message);
  } else {
    // generate dummy payload of approximate size
    var dummyPayload = [];
    var adjSize = payloadsize - 4;
    if (adjSize <= 0) adjSize = 1;
    var str = '';
    for (var i = 0; i < adjSize; i++) str += 'a';
    dummyPayload.push(str);
    reply.code(code).send(dummyPayload);
  }
}
