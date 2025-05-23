# build the jslib entry file for yao framework

patch:
	bun patch 'node_modules/@protobufjs/inquire'
	# patch the nodejs code
	sed -i 's/var mod = eval("quire".replace(\/^\/,"re"))(moduleName);/var mod = require(moduleName);/g'
	bun patch --commit 'node_modules/@protobufjs/inquire'

linux:clean
	bun install && bun build --compile --target=bun-linux-x64 ./main.js --outfile ../../yaoapp/plugins/jslib.so 

windows:clean
	bun install && bun build --compile --target=bun-windows-x64 ./main.js --outfile ../../yaoapp/plugins/jslib.exe 
	del ../../yaoapp/plugins/jslib.dll
	mv ../../yaoapp/plugins/jslib.exe ../../plugins/jslib.dll

clean:
	rm -f ../../yaoapp/plugins/jslib.dll
	rm -f ../../yaoapp/plugins/jslib.so