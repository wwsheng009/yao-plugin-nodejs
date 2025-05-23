// yao run scripts.mylib.test
function test() {
  let output = Process("plugins.bunlib.hello", "hello ", "world");
  console.log(output);
  // output = Process("plugins.bunlib.listSystemdServicesJson", "hello ", "world");
  // console.log(output);

  return output;
}
