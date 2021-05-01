const path = require('path');
const { pathOr } = require('ramda');
const Span = require('./main/span');

const PROTO_PATH = __dirname + '/protos/opentelemetry/proto/collector/trace/v1/trace_service.proto';

const includeDirs = [path.resolve(__dirname, 'protos')];

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs });
const trace_proto = grpc.loadPackageDefinition(packageDefinition).opentelemetry.proto.collector.trace.v1;

/**
 * Implements the Export RPC method.
 */
function Export(call, callback) {
  console.log(`Got spans!`);
  let resourceSpans = pathOr([], ['request', 'resource_spans'], call);
  for (let rs of resourceSpans) {
    let span = new Span().fromOtel(rs);
    console.log(`Span: trace_id=${span.trace_id}`);
  }

  // Response ?
  callback(null, { message: 'Hello ' + call.request.name });
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  const server = new grpc.Server();
  server.addService(trace_proto.TraceService.service, { Export: Export });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });
}

main();
