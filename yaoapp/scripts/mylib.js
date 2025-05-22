// yao run scripts.mylib.test
function test() {
  let output = Process("plugins.jslib.hello", "hello ", "world");
  console.log(output);
  output = Process("plugins.jslib.listSystemdServicesJson", "hello ", "world");
  console.log(output);

  return output;
}
