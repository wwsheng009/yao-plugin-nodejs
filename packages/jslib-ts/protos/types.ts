import * as grpc from "@grpc/grpc-js";

export interface Empty {}

export interface Request {
  name: string;
  payload: Buffer;
}

export interface Response {
  response: Buffer;
  type: string;
}

export interface IGRPCControllerServer {
  shutdown: (call: grpc.ServerUnaryCall<Empty, Empty>, callback: grpc.sendUnaryData<Empty>) => void;
}

export interface IModelServer {
  exec: (call: grpc.ServerUnaryCall<Request, Response>, callback: grpc.sendUnaryData<Response>) => Promise<void>;
}