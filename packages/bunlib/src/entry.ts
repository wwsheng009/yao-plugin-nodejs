import { logger } from "./log";
/**
 * 处理请求的函数
 * @param {string} method - 请求的方法
 * @param {...*} args - 请求的参数
 * @returns {any} - 返回处理后的结果
 */
export async function process(method: string, ...args: any[]): Promise<any> {
    // 记录请求方法的日志
    logger.info(`Exec request method:` + method);
    return args;
}
