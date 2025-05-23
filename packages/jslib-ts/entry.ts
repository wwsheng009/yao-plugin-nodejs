import { logger } from "./log";
// const { NativeEmbedder } = require('./native')
/**
 * 处理请求的函数
 * @param {string} method - 请求的方法
 * @param {...*} args - 请求的参数
 * @returns {any} - 返回处理后的结果
 */
async function process(method: string, ...args: any[]): Promise<any> {
    // 记录请求方法的日志
    logger.info(`Exec request method:` + method);

    // const data = new NativeEmbedder().embedTextInput("xxxxxxx")
    // logger.info(data)
    // 返回请求的参数数组
    if (method === 'listSystemdServicesJson') {
        return await listSystemdServicesJson();
    }
    return args;
}

async function listSystemdServicesJson(): Promise<void> {
    try {
        const { $ } = await import('bun');
        const result = await $`systemctl list-units --type=service --all --output=json`;
        const services = JSON.parse(result.stdout.toString());
        for (const service of services) {
            logger.info(`Service: ${service.unit}, State: ${service.active}, Sub: ${service.sub}`);
        }
    } catch (error) {
        logger.info('Error fetching or parsing systemctl output:', error);
    }
}

export {
    process
}