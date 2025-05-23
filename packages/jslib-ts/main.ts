import * as grpc from "@grpc/grpc-js";
import { logger } from "./log";
import { process } from "./entry";
import { ModelService, ModelServer, Request, Response } from "./protos/ts/model";
import { GRPCControllerService, GRPCControllerServer, Empty } from "./protos/ts/grpc_controller";

let server: grpc.Server;

const grpcControllerImpl: GRPCControllerServer = {
  shutdown(call: grpc.ServerUnaryCall<Empty, Empty>, callback: grpc.sendUnaryData<Empty>): void {
    logger.info("Shutdown requested");
    callback(null, {});
    server.tryShutdown(() => {
      logger.info("gRPC server shutdown completed");
    });
  },
};

const modelImpl: ModelServer = {
  async exec(
    call: grpc.ServerUnaryCall<Request, Response>,
    callback: grpc.sendUnaryData<Response>
  ): Promise<void> {
    try {
      logger.info(`Exec request method: ${call.request.name}`);
      logger.info(`Exec request payload: ${call.request.payload.toString()}`);
      const payload = JSON.parse(call.request.payload.toString());
      const result = await process(call.request.name, ...payload);
      const response: Response = {
        response: Buffer.from(JSON.stringify({ data: result })),
        type: "map",
      };
      callback(null, response);
    } catch (error) {
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: `Invalid payload format: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  },
};

function main() {
  server = new grpc.Server();
  server.addService(GRPCControllerService, grpcControllerImpl);
  server.addService(ModelService, modelImpl);

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