// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
// Copyright (c) HashiCorp, Inc.
// SPDX-License-Identifier: MPL-2.0
//
'use strict';
var grpc = require('@grpc/grpc-js');
var protos_grpc_controller_pb = require('../protos/grpc_controller_pb.js');

function serialize_plugin_Empty(arg) {
  if (!(arg instanceof protos_grpc_controller_pb.Empty)) {
    throw new Error('Expected argument of type plugin.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_plugin_Empty(buffer_arg) {
  return protos_grpc_controller_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}


// The GRPCController is responsible for telling the plugin server to shutdown.
var GRPCControllerService = exports.GRPCControllerService = {
  shutdown: {
    path: '/plugin.GRPCController/Shutdown',
    requestStream: false,
    responseStream: false,
    requestType: protos_grpc_controller_pb.Empty,
    responseType: protos_grpc_controller_pb.Empty,
    requestSerialize: serialize_plugin_Empty,
    requestDeserialize: deserialize_plugin_Empty,
    responseSerialize: serialize_plugin_Empty,
    responseDeserialize: deserialize_plugin_Empty,
  },
};

exports.GRPCControllerClient = grpc.makeGenericClientConstructor(GRPCControllerService, 'GRPCController');
