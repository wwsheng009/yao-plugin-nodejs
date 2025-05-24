# Yao Bun Plugin

使用可Bun可以把js打包成可运行文件。

## 模板项目

使用目录packages/bunlib下的模板项目。

## 安装

```sh
cd pckages/bunlib
bun install 
make linux
```

## 测试

```sh
cd yaoapp
yao run scripts.mylib.test

```
## Docker

Bun运行时依赖glibc与具体的版本有关，在构建docker镜像时需要使用合适的版本的镜像来构建bun应用。

比如alpine镜像就使用`oven/bun:alpine`来构建bun应用，并且需要安装glibc。

docker镜像参考列表：https://hub.docker.com/r/oven/bun

如镜像不正确，会出现类似下面的错误：
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

## 已知问题

在wsl中如果当前目前存在.env环境变量，bun会自动的加载.env文件，可能会导致bun无法正常运行。参考：https://github.com/oven-sh/bun/issues/18940