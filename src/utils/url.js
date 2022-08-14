/*
 * @Author: wuqinfa
 * @Date: 2022-05-10 10:17:57
 * @LastEditTime: 2022-05-26 14:46:06
 * @LastEditors: wuqinfa
 * @Description:
 */
import qs from 'qs';

/**
 * 获取 url 上问号参数，将其转成 key-value 的对象返回
 * @returns {Object} 问号参数
 */
export const getSearchObj = (options = { ignoreQueryPrefix: true }) => {
    return options ? qs.parse(window.location.search, options) : qs.parse(window.location.search);
}
