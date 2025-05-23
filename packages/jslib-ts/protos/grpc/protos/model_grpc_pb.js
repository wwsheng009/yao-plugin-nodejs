// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var protos_model_pb = require('../protos/model_pb.js');

function serialize_proto_Request(arg) {
  if (!(arg instanceof protos_model_pb.Request)) {
    throw new Error('Expected argument of type proto.Request');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_proto_Request(buffer_arg) {
  return protos_model_pb.Request.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_proto_Response(arg) {
  if (!(arg instanceof protos_model_pb.Response)) {
    throw new Error('Expected argument of type proto.Response');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_proto_Response(buffer_arg) {
  return protos_model_pb.Response.deserializeBinary(new Uint8Array(buffer_arg));
}


var ModelService = exports.ModelService = {
  exec: {
    path: '/proto.Model/Exec',
    requestStream: false,
    responseStream: false,
    requestType: protos_model_pb.Request,
    responseType: protos_model_pb.Response,
    requestSerialize: serialize_proto_Request,
    requestDeserialize: deserialize_proto_Request,
    responseSerialize: serialize_proto_Response,
    responseDeserialize: deserialize_proto_Response,
  },
};

exports.ModelClient = grpc.makeGenericClientConstructor(ModelService, 'Model');
