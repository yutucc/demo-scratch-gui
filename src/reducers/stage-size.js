/*
 * @Author: wuqinfa
 * @Date: 2022-06-20 10:26:17
 * @LastEditors: wuqinfa
 * @Description:
 */
import isEqual from 'lodash.isequal';

import layout, {STAGE_DISPLAY_SIZES} from '../lib/layout-constants.js';

const SET_STAGE_SIZE = 'scratch-gui/StageSize/SET_STAGE_SIZE';
const SET_STAGE_NATIVE_SIZE = 'scratch-gui/StageSize/SET_STAGE_NATIVE_SIZE';

const initialState = {
    stageSize: STAGE_DISPLAY_SIZES.large,
    stageNativeSize: [layout.standardStageWidth, layout.standardStageHeight], // 记录当前舞台 canvas 的实际物理像素，即 canvas 的 width 和 height 属性的值
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_STAGE_SIZE:
        return {
            stageSize: action.stageSize
        };
    case SET_STAGE_NATIVE_SIZE:
        // 如果前后的 stageNativeSize 值没有发生变化，就没必要更新，减少不必要的渲染
        if (isEqual(state.stageNativeSize, action.stageNativeSize)) {
            return state;
        }

        return {
            ...state,
            stageNativeSize: action.stageNativeSize
        };
    default:
        return state;
    }
};

const setStageSize = function (stageSize) {
    return {
        type: SET_STAGE_SIZE,
        stageSize: stageSize
    };
};

const setStageNativeSize = function (stageNativeSize) {
    return {
        type: SET_STAGE_NATIVE_SIZE,
        stageNativeSize: stageNativeSize
    };
};

export {
    reducer as default,
    initialState as stageSizeInitialState,
    setStageSize,
    setStageNativeSize,
};
