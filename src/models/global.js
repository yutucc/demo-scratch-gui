/*
 * @Author: wuqinfa
 * @Date: 2022-04-20 16:54:13
 * @LastEditTime: 2022-07-16 15:22:07
 * @LastEditors: wuqinfa
 * @Description: 全局的 state 放这个 model 里
 */

export default {
    namespace: 'global',

    state: {
        isLoading: false, // 控制 src/containers/@mxc/global-loading-modal.jsx 全局 loading 展示效果
        loadingTip: '加载中', // 全局 loading 时的提示文案（PS：这个是全局公用的，用完记得重置）

        role: 'student', // 当前用户的角色。student - 学生；teacher - 老师
    },

    effects: {
    },

    reducers: {

        _setIsLoading(state, { payload }) {
            return {
                ...state,
                isLoading: payload,
            };
        },

        _setLoadingTip(state, { payload }) {
            return {
                ...state,
                loadingTip: payload,
            };
        },

        _resetLoadingTip(state) {
            return {
                ...state,
                loadingTip: '加载中',
            };
        },

        _setRole(state, { payload }) {
            return {
                ...state,
                role: payload,
            };
        },
    },
}
