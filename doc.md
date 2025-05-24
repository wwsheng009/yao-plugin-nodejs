## 在yao中使用nodejs grpc插件


## 动态调用，未打包调用

生成一个yao插件的调用器。

```sh
make linux-nodejs
```

## Bun打包

在使用Bun打包时，如果是使用protobufjs加载本地的proto文件，会出现问题。
```sh
bun build --compile main.js
```
bun runtime is supported,the issue is closed: https://github.com/oven-sh/bun/issues/887

the http2 server detail: https://nodejs.org/api/http2.html

but you can not compile the project into a single file. because the bun compile not support the protobufjs.

## protobufjs

```js
PS E:\projects\yao\plugins\yao-plugin-nodejs\yaoapp\nodejs\jslib> .\main.exe
6222 |         }
6223 |         return;
6224 |       }
6225 |       if (sync) {
6226 |         var source;
6227 |           source = util.fs.readFileSync(filename2).toString("utf8");
                                 ^
TypeError: null is not an object (evaluating 'util.fs.readFileSync')
      at fetch2 (B:/~BUN/root/main:6227:27)
      at load (B:/~BUN/root/main:6256:15)
      at loadProtosWithOptionsSync (B:/~BUN/root/main:9441:37)
      at loadSync (B:/~BUN/root/main:10168:61)
      at <anonymous> (B:/~BUN/root/main:60035:57)
      at <anonymous> (B:/~BUN/root/main:18:49)
      at B:/~BUN/root/main:60088:28
      at loadAndEvaluateModule (1:11)
```

- [@protobufjs/inquire issue when bundled with bun](https://github.com/oven-sh/bun/issues/14891)

从代码上看，是因为protobufjs的inquire调用eval require。这个目的是估计为了支持浏览器的环境。

```js
function fetch(filename, options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = {};
    } else if (!options)
        options = {};

    if (!callback)
        return asPromise(fetch, this, filename, options); // eslint-disable-line no-invalid-this

    // if a node-like filesystem is present, try it first but fall back to XHR if nothing is found.
    if (!options.xhr && fs && fs.readFile)
        return fs.readFile(filename, function fetchReadFileCallback(err, contents) {
            return err && typeof XMLHttpRequest !== "undefined"
                ? fetch.xhr(filename, options, callback)
                : err
                ? callback(err)
                : callback(null, options.binary ? contents : contents.toString("utf8"));
        });

    // use the XHR version otherwise.
    return fetch.xhr(filename, options, callback);
}
```

解决方法,使用bun的patch功能,修改特定的文件，进行兼容处理。

```sh
bun patch 'node_modules/@protobufjs/inquire'
```

修改文件：node_modules\@protobufjs\inquire\index.js
```js
function inquire(moduleName) {
    try {
        // 注释掉下面的代码
        // var mod = eval("quire".replace(/^/,"re"))(moduleName); // eslint-disable-line no-eval
        // 新的代码
        var mod = require(moduleName);
        if (mod && (mod.length || Object.keys(mod).length))
            return mod;
    } catch (e) {} // eslint-disable-line no-empty
    return null;
}
```

应用修改
```sh
bun patch --commit 'node_modules/@protobufjs/inquire'
```

打包

```sh
bun build --compile main.js
```

## proto文件转换

在js中，除了使用protobufjs加载proto本地文件，还可以有多种方式生成proto对象对应的js代码,推荐使用ts-proto方式生成。

### ts-proto

使用 ts-proto，直接生成ts文件，以及服务定义文件。

```bash
bun add ts-proto
#需要注意参数需要指向正确的执行文件--plugin=protoc-gen-ts_proto.exe
bunx protoc --plugin=protoc-gen-ts_proto.exe=node_modules/.bin/ts-proto --ts_proto_out=ts --ts_proto_opt=outputServices=grpc-js protos/model.proto protos/grpc_controller.proto
#会生成protos/protos/model.ts和protos/protos/grpc_controller.ts文件

#在main_ts_proto.ts中导入生成的ts文件
import { ModelService, ModelServer, Request, Response } from "./protos/ts/model";
import { GRPCControllerService, GRPCControllerServer, Empty } from "./protos/ts/grpc_controller";
```

### 使用protobufjs生成json代码。

先把proto文件转换成json定义文件，再使用protobufjs加载。

```sh
bun install -d protobufjs-cli

bunx pbjs -t json protos/model.proto  > ./protos/json/model.json
bunx pbjs -t json protos/grpc_controller.proto > ./protos/json/grpc_controller.json
# 也可以使用pbjs命令将多个proto文件合并成一个json文件
bunx pbjs -t json protos/model.proto  protos/grpc_controller.proto > ./protos/json/bundle.json
# 也可以使用脚本进行转换
bun scripts/generate_proto_json.ts

# 生成的json文件可以直接使用protobufjs加载
# 需要额外生成一个ts的类型定义文件protos/types.ts
```


### 使用grpc-tools

使用grpc-tools工具生成js文件，与grpc-js配合使用。

在windows编译proto对象的ts定义文件需要注意使用的命令参数中的执行文件的路径。

```cmd
bun install grpc-tools ts-protoc-gen --save-dev

bunx grpc_tools_node_protoc ^
  --js_out=import_style=commonjs,binary:protos/grpc ^
  --grpc_out=grpc_js:protos/grpc ^
  --plugin=protoc-gen-ts=%CD%\node_modules\.bin\protoc-gen-ts.cmd ^
  --ts_out=grpc_js:protos/grpc ^
  protos/grpc_controller.proto protos/model.proto
```

检查以下文件是否存在
- node_modules\grpc-tools\bin\protoc.exe
- node_modules\grpc-tools\bin\grpc_node_plugin.exe
- node_modules\ts-protoc-gen\bin\protoc-gen-ts or node_modules\.bin\protoc-gen-ts.cmd

生成文件在目录protos/grpc/protos下。

### 使用pbjs命令行工具

[protobuf.js](https://protobufjs.github.io/protobuf.js/index.html)使用文档

从 protobufjs 7.x.x 起，pbjs 和 pbts 已被拆分为单独的包，需分别安装。
```sh
# 安装pbjs/pbts
bun install -d protobufjs-cli

bunx pbjs -t static-module -w commonjs -o protos/pbjs/compiled.js protos/grpc_controller.proto protos/model.proto
bunx pbts -o protos/pbjs/compiled.d.ts protos/pbjs/compiled.js

```
生成的js文件定义还不能直接与grpc配合使用，需要手动创建grpc所需的service对象，或是需要使用grpc-tools工具生成js文件配合使用。


## Docker

Bun运行时依赖glibc与具体的版本有关，在构建docker镜像时需要使用合适的版本的镜像来构建bun应用。

比如alpine镜像就使用`oven/bun:alpine`来构建bun应用，并且需要安装glibc,参考：`packages\bunlib\Makefile`。Yao的镜像也是基于alpine镜像构建的，所以需要使用alpine镜像。

docker镜像参考列表：https://hub.docker.com/r/oven/bun/tags?name=alpine

在alpine系统中，gcc使用的是musl库，而不是glibc。而ubuntu/debian系统中，gcc使用的是glibc库。
```sh
ldd bunlib.so
        /lib/ld-musl-x86_64.so.1 (0x7fe6aa1aa000)
        libstdc++.so.6 => /usr/lib/libstdc++.so.6 (0x7fe6a9f01000)
        libc.musl-x86_64.so.1 => /lib/ld-musl-x86_64.so.1 (0x7fe6aa1aa000)
        libgcc_s.so.1 => /usr/lib/libgcc_s.so.1 (0x7fe6a9ed5000)

```

如果在ubuntu中进行构建，复制到alpine中是不能正常运行的，会出现类似下面的错误：
```sh
/data/app/plugins # bunlib.so
sh: bunlib.so: not found

/data/app/plugins # ldd bunlib.so
        /lib64/ld-linux-x86-64.so.2 (0x7ff0ffd6f000)
        libc.so.6 => /lib64/ld-linux-x86-64.so.2 (0x7ff0ffd6f000)
Error loading shared library ld-linux-x86-64.so.2: No such file or directory (needed by bunlib.so)
        libpthread.so.0 => /lib64/ld-linux-x86-64.so.2 (0x7ff0ffd6f000)
        libdl.so.2 => /lib64/ld-linux-x86-64.so.2 (0x7ff0ffd6f000)
        libm.so.6 => /lib64/ld-linux-x86-64.so.2 (0x7ff0ffd6f000)
Error relocating bunlib.so: gnu_get_libc_version: symbol not found
Error relocating bunlib.so: backtrace: symbol not found
Error relocating bunlib.so: backtrace_symbols: symbol not found
Error relocating bunlib.so: malloc_trim: symbol not found
Error relocating bunlib.so: __cxa_thread_atexit_impl: symbol not found
Error relocating bunlib.so: __cxa_at_quick_exit: symbol not found
Error relocating bunlib.so: __register_atfork: symbol not found
Error relocating bunlib.so: __fprintf_chk: symbol not found
Error relocating bunlib.so: __sprintf_chk: symbol not found
Error relocating bunlib.so: __strftime_l: symbol not found
Error relocating bunlib.so: __cxa_thread_atexit_impl: symbol not found
Error relocating bunlib.so: unsupported relocation type 37
Error relocating bunlib.so: unsupported relocation type 37
Error relocating bunlib.so: unsupported relocation type 37
```