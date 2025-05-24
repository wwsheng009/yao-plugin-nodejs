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
  logger.info(`gRPC server starting...`);
  server = new grpc.Server();
  server.addService(GRPCControllerService, grpcControllerImpl);
  server.addService(ModelService, modelImpl);

  let port = "127.0.0.1:0"
  let handshake = "`1|1|tcp|127.0.0.1:${port}|grpc`;"

  // 检查操作系统是否为Linux
  if (require('process').platform === 'linux') {
    // 生成随机数用于socket文件名
    const random = Math.floor(Math.random() * 10000);
    port = `unix:/tmp/bunlib-${random}.sock`;
    handshake = `1|1|unix|/tmp/bunlib-${random}.sock|grpc`;
  }
  server.bindAsync(
    port,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        logger.error(`Failed to bind server: ${error.message}`);
        return;
      }
      // server.start();
      // grpc协议握手
      // 1 CoreProtocolVersion固定版本
      // 1 ProtocolVersion固定版本
      // tcp 网络协议tcp/unix，tcp协议或是unix socket
      // netrpc/grpc 协议类型，插件只支持grpc
      // 输出到stdout，唯一的输出，其它的日志使用logger
      console.log(handshake);
      logger.info(`gRPC server running on port ${port}`);
    }
  );
}
console.log(require('process').env)
main();