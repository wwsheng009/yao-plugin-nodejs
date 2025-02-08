const { NativeEmbedder } = require('./native')

async function test() {
    const data = await new NativeEmbedder().embedTextInput("xxxxxxx")
    console.log(data)
}
test()