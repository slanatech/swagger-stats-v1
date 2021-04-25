const path = require('path');

const PROTO_PATH = __dirname + '/jaeger-idl/proto/api_v2/collector.proto';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const protoFiles = require('google-proto-files');

const includeDirs = [path.resolve(__dirname, './jaeger-idl/proto/api_v2'), path.resolve(__dirname, './gogo'), protoFiles.getProtoPath('..')];

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
const collector_proto = collector_def.jaeger.api_v2;

/**
 * Implements the PostSpans RPC method.
 */
function PostSpans(call, callback) {
  console.log(`Got PostSpans !`);
  callback(null, { message: 'Hello ' + call.request.name });
  // TODO Response ?
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  let server = new grpc.Server();
  server.addService(collector_proto.CollectorService.service, { PostSpans: PostSpans });
  console.log(`Starting server ...`);
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log(`Server Started ...`);
  });
}

main();
