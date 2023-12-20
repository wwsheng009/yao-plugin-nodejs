// yao run scripts.mylib.test
function test() {
  let output = Process("plugins.nodejs.hello", "hello world");
  return output;
}
