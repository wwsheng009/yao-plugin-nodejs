const { logger } = require("./log");

/**
 * 处理请求的函数
 * @param {string} method - 请求的方法
 * @param {...*} args - 请求的参数
 * @returns {any} - 返回处理后的结果
 */
function process(method, ...args) {
    // 记录请求方法的日志
    logger.info(`Exec request method:` + method);
    // 返回请求的参数数组
    return args;
}

module.exports = {
    process
}