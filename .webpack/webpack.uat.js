/*
 * @Author: wuqinfa
 * @Date: 2022-04-26 16:44:25
 * @LastEditTime: 2022-07-31 10:26:41
 * @LastEditors: wuqinfa
 * @Description:
 */
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const formatDefine = require('./utils/format-define.js');


module.exports = merge(common, {
    plugins: [
        new webpack.DefinePlugin(
            formatDefine({
                API_URL: 'https://api-uat.xxx.com/api',
            })
        ),
    ],
});
