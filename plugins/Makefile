linux:clean
	go build -o ./nodejs.so ./bun.go

clean:
	@if [ -f nodejs.dll ]; then rm nodejs.dll; fi
	@if [ -f nodejs.so ]; then rm nodejs.so; fi