// yao run scripts.mylib.test
function test() {
  let output = Process("plugins.jslib.hello", "hello world");
  return output;
}
