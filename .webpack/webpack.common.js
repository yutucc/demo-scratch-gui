/*
 * @Author: wuqinfa
 * @Date: 2022-04-26 16:43:49
 * @LastEditTime: 2022-07-31 21:52:28
 * @LastEditors: wuqinfa
 * @Description:
 */
const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HtmlWebpackPlugin = require('html-webpack-plugin');

const autoprefixer = require('autoprefixer');
const postcssVars = require('postcss-simple-vars');
const postcssImport = require('postcss-import');

const formatDefine = require('./utils/format-define.js');
const { rootPath } = require('./utils/webpack-paths.js');

const pkg = require('../package.json');

const publicPath = '';

const analyzer = process.env.MY_ANALYZE === 'analyze' ? [new BundleAnalyzerPlugin()] : [];

console.log('process.env.NODE_ENV :>> ', process.env.NODE_ENV);
console.log('process.env.MY_ENV :>> ', process.env.MY_ENV);

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

    devtool: 'cheap-module-source-map',
    devServer: {
        contentBase: path.join(rootPath, 'build'),
        disableHostCheck: true,
        port: process.env.PORT || 8601,
        // TODO: 需要开启代理的，可以这里自行添加
        // proxy: {
        //     '/api': {
        //         target: 'https://xxxx.com',
        //         changeOrigin: true,
        //         secure: false,
        //     },
        // },
    },

    resolve: {
        symlinks: false,
        extensions: ['.js', '.json', '.jsx'],
        alias: {
            '@': path.join(rootPath, 'src'),
        },
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                include: [
                    // path.resolve(__dirname, 'src'),  官方的配置上有这个
                    /node_modules[\\/]scratch-[^\\/]+[\\/]src/,
                    /node_modules[\\/]pify/,
                    /node_modules[\\/]@vernier[\\/]godirect/,
                ],
                exclude: [
                    path.join(rootPath, 'src'),
                ],
                options: {
                    // Explicitly disable babelrc so we don't catch various config
                    // in much lower dependencies.
                    babelrc: false,
                    // plugins: [
                    //     ['react-intl', {
                    //         messagesDir: './translations/messages/'
                    //     }]
                    // ],
                    presets: ['@babel/preset-env', '@babel/preset-react'],
                }
            },
            /*
            本来官方的配置只有上面一个 babel-loader，但上述的配置不支持 async await 语法
            但，如果直接在上面的 babel-loader 加入  '@babel/plugin-transform-runtime' 的话，有些包有问题
            故，进行了如下处理：
                1. 安装 @babel/plugin-transform-runtime 的相关依赖：
                    npm install --save-dev @babel/plugin-transform-runtime
                    npm install --save @babel/runtime
                2. 多加下面这个 babel-loader，让其只对 src 目录下的文件进行处理，确保 @babel/plugin-transform-runtime 不会影响其它依赖包
            */
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                include: [
                    path.join(rootPath, 'src'),
                ],
                exclude: [
                    /node_modules/,
                ],
                options: {
                    // Explicitly disable babelrc so we don't catch various config
                    // in much lower dependencies.
                    babelrc: false,
                    plugins: [
                        '@babel/plugin-transform-runtime',
                        ['react-intl', {
                            messagesDir: './translations/messages/',
                        }]
                    ],
                    presets: ['@babel/preset-env', '@babel/preset-react'],
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[name]_[local]_[hash:base64:5]',
                            camelCase: true,
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: function () {
                                return [
                                    postcssImport,
                                    postcssVars,
                                    autoprefixer,
                                ];
                            }
                        }
                    }
                ],
            },

            {
                test: /\.(svg|png|wav|gif|jpg)$/,
                loader: 'file-loader',
                options: {
                    outputPath: 'static/assets/'
                }
            },
        ],
    },

    plugins: [
        new webpack.DefinePlugin(
            formatDefine({
                'process.env.NODE_ENV': process.env.NODE_ENV,
                MY_ENV: process.env.MY_ENV,
                MXC_VERSION: pkg.version,
            }),
        ),

        new CopyWebpackPlugin({
            patterns: [
                { from: 'static', to: 'static' },
                { from: 'node_modules/scratch-blocks/media', to: 'static/blocks-media' },
                { from: 'extensions/**', to: 'static', context: 'src/examples' },
                { from: 'extension-worker.{js,js.map}', context: 'node_modules/scratch-vm/dist/web' },
            ]
        }),

        new CopyWebpackPlugin({
            patterns: [
                { from: 'node_modules/scratch-blocks/media', to: 'static/blocks-media' },
                { from: 'extension-worker.{js,js.map}', context: 'node_modules/scratch-vm/dist/web' },

                // Include library JSON files for scratch-desktop to use for downloading
                { from: 'src/lib/libraries/*.json', to: 'libraries', flatten: true },
            ]
        }),

        ...analyzer,
        new HtmlWebpackPlugin({
            chunks: ['gui'],
            template: 'src/playground/index.ejs',
            title: 'Scratch 3.0 GUI',
        }),
    ],

    entry: {
        'gui': './src/playground/index.jsx',
    },

    output: {
        filename: '[name].[chunkhash].js',
        chunkFilename: 'chunks/[name].[chunkhash].js',
        path: path.join(rootPath, 'build'),
        publicPath,
    },

    // 把 node_modules 中的 scratch 相关以及其它第三方库分别打包
    optimization: {
        splitChunks: {
            minSize: 30,
            cacheGroups: {
                scratchVendors: {
                    test: /[\\/]node_modules[\\/]scratch-[^\\/]+[\\/]/,
                    name: 'scratch-vendor',
                    chunks: 'initial',
                    priority: -10
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'initial',
                    priority: -20
                }
            }
        }
    }
};
