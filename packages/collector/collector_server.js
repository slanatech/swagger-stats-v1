const path = require('path');

const PROTO_PATH = __dirname + '/protos/opentelemetry/proto/collector/trace/v1/trace_service.proto';

const includeDirs = [path.resolve(__dirname, 'protos')];

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs });
var trace_proto = grpc.loadPackageDefinition(packageDefinition).opentelemetry.proto.collector.trace.v1;

/**
 * Implements the Export RPC method.
 */
function Export(call, callback) {
  callback(null, { message: 'Hello ' + call.request.name });
  // TODO Response ?
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  var server = new grpc.Server();
  server.addService(trace_proto.TraceService.service, { Export: Export });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });
}

main();
