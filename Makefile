# build the jslib entry file for yao framework

linux-bun:clean
	go build -o ./yaoapp/plugins/jslib.so ./bun.go


windows-grpc:clean
	CGO_ENABLED=0 GOARCH=amd64 GOOS=windows GOHOSTOS=linux go build -o ./yaoapp/plugins/jslib.dll ./grpc.go


windows-bun:clean
	CGO_ENABLED=0 GOARCH=amd64 GOOS=windows GOHOSTOS=linux go build -o ./yaoapp/plugins/jslib.dll ./bun.go

linux-nodejs:clean
	go build -o ./yaoapp/plugins/jslib.so ./nodejs.go

windows-nodejs:clean
	CGO_ENABLED=0 GOARCH=amd64 GOOS=windows GOHOSTOS=linux go build -o ./yaoapp/plugins/jslib.dll ./nodejs.go

# not working yet
bun-compile:clean
	cd ./yaoapp/plugins/jslib && bun install && bun build --compile --target=bun-windows-x64 ./main.js --outfile ../jslib && mv ../jslib.exe ../jslib.dll 

clean:
	rm -f ./yaoapp/plugins/jslib.dll
	rm -f ./yaoapp/plugins/jslib.so