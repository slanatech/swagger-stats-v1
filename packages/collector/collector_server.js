const path = require('path');
const http = require('http');
const { pathOr } = require('ramda');
const logger = require('./main/logger')('MAIN');
const monitor = require('./main/monitor');
const Span = require('./main/span');
const processor = require('./main/processor');

const PROTO_PATH = __dirname + '/protos/opentelemetry/proto/collector/trace/v1/trace_service.proto';

const includeDirs = [path.resolve(__dirname, 'protos')];

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs });
const trace_proto = grpc.loadPackageDefinition(packageDefinition).opentelemetry.proto.collector.trace.v1;

// Express and middlewares
const express = require('express');
const expressBodyParser = require('body-parser');
const app = (module.exports = express());
app.use(expressBodyParser.json());
app.use(expressBodyParser.urlencoded({ extended: true }));
app.set('json spaces', 2);
app.set('json replacer', null);
app.set('port', process.env.PORT || 3060);
app.disable('etag'); // Suppress cache on the GET API responses

// Server
let httpServer = null;

app.get('/', function (req, res) {
  res.json({ name: 'collector-server' });
});

app.get('/metrics', async function (req, res) {
  res.status(200).set('Content-Type', 'text/plain');
  const metricValues = await monitor.getMetricValues();
  res.end(metricValues);
});

/**
 * Implements the Export RPC method.
 */
async function Export(call, callback) {
  logger.info(`Got spans!`);
  let resourceSpans = pathOr([], ['request', 'resource_spans'], call);
  let spansBatch = [];
  for (let rs of resourceSpans) {
    let span = new Span().fromOtel(rs);
    logger.info(`Span: traceId=${span.traceId}, spanId:${span.spanId}, parentSpanId:${span.parentSpanId}`);
    spansBatch.push(span);
  }

  // Process
  await processor.processSpans(spansBatch);

  // Response
  callback(null, {});
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  const server = new grpc.Server();
  let grpcPort = 50051;
  server.addService(trace_proto.TraceService.service, { Export: Export });
  server.bindAsync(`0.0.0.0:${grpcPort}`, grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    logger.info(`GRPC Server Started on port ${grpcPort}`);
  });

  httpServer = http.createServer(app);
  httpServer.listen(app.get('port'));
  httpServer.keepAliveTimeout = 61 * 1000;
  httpServer.headersTimeout = 65 * 1000;
  logger.info('HTTP Server started on port ' + app.get('port') + ' http://localhost:' + app.get('port'));
}

main();
