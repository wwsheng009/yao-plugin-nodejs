import * as grpc from "@grpc/grpc-js";
import { logger } from "./log";
import { process } from "./entry";
// Import the generated gRPC service definitions
// @ts-ignore 忽略类型检查，因为 .js 文件缺少类型声明
import * as grpcControllerProto from "./protos/grpc/protos/grpc_controller_grpc_pb.js";
// @ts-ignore 忽略类型检查，因为 .js 文件缺少类型声明
import * as modelProto from "./protos/grpc/protos/model_grpc_pb.js";
// Import message types
import * as protoMessages from "./protos/grpc/protos/model_pb";
import * as pluginMessages from "./protos/grpc/protos/grpc_controller_pb";
import { IGRPCControllerServer, IModelServer } from "./protos/grpc/protos/types";

let server: grpc.Server;

// Implement the Shutdown RPC method
const grpcControllerImpl: IGRPCControllerServer = {
  shutdown: (
    call: grpc.ServerUnaryCall<pluginMessages.Empty, pluginMessages.Empty>,
    callback: grpc.sendUnaryData<pluginMessages.Empty>
  ) => {
    logger.info("Shutdown requested");
    callback(null, new pluginMessages.Empty());
    server.tryShutdown(() => {
      logger.info("gRPC server shutdown completed");
    });
  },
};

// Implement the Exec RPC method
const modelImpl: IModelServer = {
  exec: async (
    call: grpc.ServerUnaryCall<protoMessages.Request, protoMessages.Response>,
    callback: grpc.sendUnaryData<protoMessages.Response>
  ) => {
    try {
      logger.info(`Exec request method: ${call.request.getName()}`);
      logger.info(`Exec request payload: ${call.request.getPayload().toString()}`);
      const payload = JSON.parse(call.request.getPayload().toString());
      const result = await process(call.request.getName(), ...payload);
      const response = new protoMessages.Response();
      response.setResponse(Buffer.from(JSON.stringify({ data: result })));
      response.setType("map");
      callback(null, response);
    } catch (error) {
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: `Invalid payload format: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  },
};

// Main function to start the server
function main() {
  server = new grpc.Server();
  // Add services using the generated service definitions
  server.addService(grpcControllerProto.GRPCControllerService, grpcControllerImpl);
  server.addService(modelProto.ModelService, modelImpl);

  server.bindAsync(
    "127.0.0.1:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        logger.error(`Failed to bind server: ${error.message}`);
        return;
      }
      server.start();
      const handshake = "1|1|tcp|127.0.0.1:50051|grpc";
      console.log(handshake);
      logger.info("gRPC server running on port 50051");
    }
  );
}

main();