/*
 * @Author: wuqinfa
 * @Date: 2022-04-26 18:06:29
 * @LastEditTime: 2022-04-27 16:12:16
 * @LastEditors: wuqinfa
 * @Description: 格式化 webpack.DefinePlugin 的对象
 *      除 Boolean、Number 外，其它类型的都使用 JSON.stringify 转成字符串
 */

function formatDefine(target) {
    const result = {};

    for (const key in target) {
        const element = target[key];

        if (typeof element === 'boolean' || typeof element === 'number') {
            result[key] = element;
        } else {
            result[key] = JSON.stringify(element);
        }
    }

    return result;
}

module.exports = formatDefine;
