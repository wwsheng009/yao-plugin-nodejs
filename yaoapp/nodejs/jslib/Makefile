# build the jslib entry file for yao framework

patch:
	bun patch 'node_modules/@protobufjs/inquire'
	# patch the nodejs code
	sed -i 's/var mod = eval("quire".replace(\/^\/,"re"))(moduleName);/var mod = require(moduleName);/g'
	bun patch --commit 'node_modules/@protobufjs/inquire'

linux:clean
	bun install && bun build --compile --target=bun-linux-x64 ./main.js --outfile ../../plugins/jslib.so 

windows:clean
	bun install && bun build --compile --target=bun-windows-x64 ./main.js --outfile ../../plugins/jslib.dll 
	mv ../../plugins/jslib.dll.exe ../../plugins/jslib.dll

clean:
	rm -f ../../plugins/jslib.dll
	rm -f ../../plugins/jslib.so