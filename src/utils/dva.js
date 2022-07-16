/*
 * @Author: wuqinfa
 * @Date: 2022-04-19 16:41:11
 * @LastEditTime: 2022-04-28 11:57:07
 * @LastEditors: wuqinfa
 * @Description: 初始化 dva-core 的内容，项目里面只引入了 dva-core，作为数据管理，没有引入 dva 的其它内容
 */
import { create } from 'dva-core';
import createLoading from 'dva-loading';

let app;
let store;
let dispatch;
let registered;

/**
 * 创建一个 dva app 对象
 * @param {Object} opt 详细参数可见： https://dvajs.com/api/#dva-api
 * @returns
 */
function createApp(opt) {
    app = create(opt)
    app.use(createLoading({}))

    if (!registered) {
        opt.models.forEach(model => app.model(model));
    }

    registered = true;
    app.start();

    store = app._store;
    app.getStore = () => store;
    app.use({
        onError(err) {
            console.log('dva-err :>> ', err);
        },
    });

    dispatch = store.dispatch;
    app.dispatch = dispatch;

    return app;
}

export {
    createApp,
    dispatch,
    app,
};
