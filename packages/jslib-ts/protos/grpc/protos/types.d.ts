import * as grpc from "@grpc/grpc-js";
import * as protoMessages from "./model_pb";
import * as pluginMessages from "./grpc_controller_pb";

export type IGRPCControllerServer = {
  shutdown: (
    call: grpc.ServerUnaryCall<pluginMessages.Empty, pluginMessages.Empty>,
    callback: grpc.sendUnaryData<pluginMessages.Empty>
  ) => void;
};

export type IModelServer = {
  exec: (
    call: grpc.ServerUnaryCall<protoMessages.Request, protoMessages.Response>,
    callback: grpc.sendUnaryData<protoMessages.Response>
  ) => Promise<void>;
};

export { Empty } from "./grpc_controller_pb";