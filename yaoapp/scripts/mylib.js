// yao run scripts.mylib.test
function test() {
  let output = Process("plugins.bunlib.hello", "hello ", "world");
  console.log(output);
  output = Process("plugins.bunlib.listSystemdServicesJson", "arg1 ", "arg2",1,2,3,4,5,6,7,8,9,10);
  console.log(output);

  return output;
}
