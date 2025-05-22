# readme

build the executor

```sh
go build -o nodejs.dll ./nodejs.go
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

解决方法：
```sh
bun patch --commit 'node_modules/@protobufjs/inquire'

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