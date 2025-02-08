# readme

build the executor

```sh
go build -o nodejs.dll ./nodejs.go
```

bun runtime is supported,the issue is closed: https://github.com/oven-sh/bun/issues/887

the http2 server detail: https://nodejs.org/api/http2.html

but you can not compile the project into a single file. because the bun compile not support the protobufjs.
