/*
 * @Author: wuqinfa
 * @Date: 2022-04-19 16:48:25
 * @LastEditTime: 2022-07-16 15:18:44
 * @LastEditors: wuqinfa
 * @Description:
 */

import template from './template';
import global from './global';


// 新定义的 models 需要在这里引入才能注册到 dva 中
export default [
    template,
    global,
];
