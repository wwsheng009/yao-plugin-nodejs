const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const directoryName = path.dirname(__filename);

const { logger } = require("./log");
// Load grpc_controller.proto

const packageDefinitionController = protoLoader.loadSync(
  `${directoryName}/grpc_controller.proto`,
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);
const grpc_controller = grpc.loadPackageDefinition(
  packageDefinitionController
).plugin;

// Load model.proto
const packageDefinitionModel = protoLoader.loadSync(
  `${directoryName}/model.proto`,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);
const model = grpc.loadPackageDefinition(packageDefinitionModel).proto;

let server;

// Implement the Shutdown RPC method
function shutdown(call, callback) {
  logger.info("Shutdown requested");
  callback(null, {});
  server.tryShutdown(() => {
    logger.info("gRPC server shutdown completed");
  });
}

// Implement the Exec RPC method
function exec(call, callback) {
  try {
    const payload = JSON.parse(call.request.payload.toString());
    logger.info(`Exec request received with payload:`, payload);

    // Implement your logic here. For example:
    // let result = someFunction(payload);

    // Dummy response

    const response = {
      response: Buffer.from(
        JSON.stringify({
          response: payload,
        })
      ),
      type: "map", // or any appropriate type
    };
    callback(null, response);
  } catch (error) {
    callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "Invalid payload format: " + error.message,
    });
  }
}

// Main function to start the server
function main() {
  server = new grpc.Server();
  server.addService(grpc_controller.GRPCController.service, {
    shutdown: shutdown,
  });
  server.addService(model.Model.service, { exec: exec });

  // you should check the port
  server.bindAsync(
    "127.0.0.1:50051",
    grpc.ServerCredentials.createInsecure(),
    () => {
      server.start();
      //must output the handshake message
      const handshake = "1|1|tcp|127.0.0.1:50051|grpc";
      console.log(handshake);
      logger.info("gRPC server running on port 50051");
    }
  );
}

main();
