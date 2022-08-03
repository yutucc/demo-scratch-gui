/*
 * @Author: wuqinfa
 * @Date: 2022-04-26 16:44:30
 * @LastEditTime: 2022-07-31 10:26:23
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
                API_URL: 'https://apicdn.xxx.com/api',
            })
        ),
    ],
});
