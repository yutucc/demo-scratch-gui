/*
 * @Author: wuqinfa
 * @Date: 2022-04-19 16:49:02
 * @LastEditTime: 2022-07-16 15:57:05
 * @LastEditors: wuqinfa
 * @Description: models 模板
 */

export default {
    namespace: 'template',

    state: {
        myName: 'nicholas',
    },

    effects: {
        /**
         * 详细可以参考： https://dvajs.com/api/#effects
         * @param {Object} param0
         *      payload  dispatch 时的 payload 参数
         *      extra    这个是自己加的参数，用来传一些额外的变量（payload一般都是直接作为接口参数，所以多加了一个，避免还要做分离）
         *         this.props.dispatch({
         *             type: 'template/tableData',
         *              payload: {
         *                  myName: 'xxx',
         *              },
         *              extra: {
         *                  friends: []
         *              },
         *          });
         * @param {Object} param1
         */
        * tableData({ payload, extra }, { call, put }) {
            yield put({
                type: '_changeState',
                payload: {
                    myName: 'demo'
                }
            });
        },
    },

    reducers: {
        /**
         * 根据传进来的 key 值，修改 state 中对应的属性值
         */
        _changeState(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        },
    },
}
