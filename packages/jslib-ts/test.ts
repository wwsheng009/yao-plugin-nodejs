import { NativeEmbedder } from './native/index'

async function test() {
    const data = await new NativeEmbedder().embedTextInput("xxxxxxx")
    console.log(data)
}
// test()