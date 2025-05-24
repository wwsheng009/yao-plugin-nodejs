# build the bunlib entry file for yao framework
alpine:clean
	docker exec -it oven/bun:alpine sh -c "bun install && bun build --compile --target=bun-linux-x64 --minify --sourcemap ./src/main.ts --outfile ../../yaoapp/plugins/bunlib.so"

linux-unix:clean
	bun install && bun build --compile --target=bun-linux-x64 ./src/main_unix.ts --outfile ../../yaoapp/plugins/bunlib.so 

linux:clean
	bun install && bun build --compile --target=bun-linux-x64 ./src/main.ts --outfile ../../yaoapp/plugins/bunlib.so 

windows:clean
	bun install && bun build --compile --target=bun-windows-x64 --minify --sourcemap ./src/main.ts --outfile ../../yaoapp/plugins/bunlib.exe 
	del ../../yaoapp/plugins/bunlib.dll
	mv ../../yaoapp/plugins/bunlib.exe ../../yaoapp/plugins/bunlib.dll

clean:
	rm -f ../../yaoapp/plugins/bunlib.dll
	rm -f ../../yaoapp/plugins/bunlib.so