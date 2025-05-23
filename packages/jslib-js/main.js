const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const directoryName = path.dirname(__filename);
const { logger } = require("./log");
const { process } = require("./entry");
// Load grpc_controller.proto

const packageDefinitionController = protoLoader.loadSync(
  `${directoryName}/protos/grpc_controller.proto`,
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);
const grpc_controller = grpc.loadPackageDefinition(
  packageDefinitionController
).plugin;

// Load model.proto
const packageDefinitionModel = protoLoader.loadSync(
  `${directoryName}/protos/model.proto`,
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
// 成功时：callback(null, response)，其中response是你想要返回给客户端的数据对象。
// 失败时：callback(error)，其中error是一个包含错误码和消息的对象。

async function exec(call, callback) {
  try {
    logger.info(`Exec request method:` + call.request.name);
    // typeof call.request.payload is Buffer
    // call.request.payload if array of the parameters of the call method,like: [1,2,3]
    logger.info(`Exec request payload:` + call.request.payload.toString());

    // Implement your logic here. For example:
    // let result = someFunction(payload);

    // Dummy response
    const payload = JSON.parse(call.request.payload.toString());

    const result = await process(call.request.name, ...payload)

    const response = {
      response: Buffer.from(
        JSON.stringify({
          data: result,
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
