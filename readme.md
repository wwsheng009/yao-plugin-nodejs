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


## 已知问题

在wsl中如果当前目前存在.env环境变量，bun会自动的加载.env文件，可能会导致bun无法正常运行。参考：https://github.com/oven-sh/bun/issues/18940