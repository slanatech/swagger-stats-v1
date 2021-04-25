const path = require('path');

//const PROTO_PATH = __dirname + '/../../jaeger-idl/proto/api_v2/collector.proto';
const PROTO_PATH = path.resolve(__dirname, '..', 'jaeger-idl', 'proto', 'api_v2', 'collector.proto');
const includeDirs = [path.resolve(__dirname, '/../../jaeger-idl'), path.resolve(__dirname, '/../../../../node_modules/google-proto-files/google/protobuf')];

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

/*
const protoFiles = require('google-proto-files');
const protoDir = protoFiles.embeddedAssistant.v1alpha2;
const packageDefinition = protoLoader.loadSync(protoDir, {
  includeDirs: [protoFiles.getProtoPath('..')],
});
*/
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs });

//const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const collector_def = grpc.loadPackageDefinition(packageDefinition);
const collector_proto = collector_def.opentelemetry.proto.collector.trace.v1;

/**
 * Implements the Export RPC method.
 */
function Export(call: any, callback: any) {
  callback(null, { message: 'Hello ' + call.request.name });
  // TODO Response ?
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  let server = new grpc.Server();
  /*
  server.addService(trace_proto.TraceService.service, { Export: Export });
  */
  console.log(`Starting server ...`);
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log(`Server Started ...`);
  });
}

main();
