import * as protobuf from "protobufjs";
import { writeFileSync } from "fs";

const grpcControllerProto = `
syntax = "proto3";
package plugin;
option go_package = "./plugin";

message Empty {}

service GRPCController {
    rpc Shutdown(Empty) returns (Empty);
}
`;

const modelProto = `
syntax = "proto3";
package proto;
option go_package = "./";

message Request {
    string name = 1;
    bytes payload = 2;
}

message Response {
    bytes response = 1;
    string type = 2;
}

service Model {
    rpc Exec(Request) returns (Response);
}
`;

async function generateJson(protoContent: string, outputPath: string) {
  const root = await protobuf.parse(protoContent).root;
  const json = root.toJSON();
  writeFileSync(outputPath, JSON.stringify(json, null, 2));
}

generateJson(grpcControllerProto, "protos/json/grpc_controller.json");
generateJson(modelProto, "protos/json/model.json");