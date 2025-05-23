import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { logger } from "./log";
import { process } from "./entry";
import { Empty, Request, Response, IGRPCControllerServer, IModelServer } from "./protos/types";

import * as proto from './protos/pbjs/compiled';


let server: grpc.Server;

const GRPCControllerService: grpc.ServiceDefinition = {
  shutdown: {
    path: "/plugin.GRPCController/Shutdown",
    requestStream: false,
    responseStream: false,
    requestSerialize: (message: proto.plugin.IEmpty) =>
      Buffer.from(proto.plugin.Empty.encode(message).finish()),
    requestDeserialize: (buffer: Buffer) => proto.plugin.Empty.decode(buffer),
    responseSerialize: (message: proto.plugin.IEmpty) =>
      Buffer.from(proto.plugin.Empty.encode(message).finish()),
    responseDeserialize: (buffer: Buffer) => proto.plugin.Empty.decode(buffer),
  },
};

const ModelService: grpc.ServiceDefinition = {
  exec: {
    path: "/proto.Model/Exec",
    requestStream: false,
    responseStream: false,
    requestSerialize: (message: proto.proto.IRequest) =>
      Buffer.from(proto.proto.Request.encode(message).finish()),
    requestDeserialize: (buffer: Buffer) => proto.proto.Request.decode(buffer),
    responseSerialize: (message: proto.proto.IResponse) =>
      Buffer.from(proto.proto.Response.encode(message).finish()),
    responseDeserialize: (buffer: Buffer) => proto.proto.Response.decode(buffer),
  },
};

// Implement the Shutdown RPC method
const grpcControllerImpl: IGRPCControllerServer = {
  shutdown(call: grpc.ServerUnaryCall<Empty, Empty>, callback: grpc.sendUnaryData<Empty>): void {
    logger.info("Shutdown requested");
    callback(null, {});
    server.tryShutdown(() => {
      logger.info("gRPC server shutdown completed");
    });
  },
};

// Implement the Exec RPC method
// 成功时：callback(null, response)，其中response是你想要返回给客户端的数据对象。
// 失败时：callback(error)，其中error是一个包含错误码和消息的对象。
const modelImpl: IModelServer = {
  async exec(call: grpc.ServerUnaryCall<Request, Response>, callback: grpc.sendUnaryData<Response>): Promise<void> {
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

// Main function to start the server
function main() {
  server = new grpc.Server();
  server.addService(GRPCControllerService, {
    shutdown: grpcControllerImpl.shutdown,
  });
  server.addService(ModelService, { exec: modelImpl.exec });

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
