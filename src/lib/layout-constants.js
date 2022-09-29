/*
 * @Author: wuqinfa
 * @Date: 2022-06-20 10:26:16
 * @LastEditors: wuqinfa
 * @Description:
 */
import keyMirror from 'keymirror';

/**
 * Names for each state of the stage size toggle
 * @enum {string}
 */
const STAGE_SIZE_MODES = keyMirror({
    /**
     * The "large stage" button is pressed; the user would like a large stage.
     */
    large: null,

    /**
     * The "small stage" button is pressed; the user would like a small stage.
     */
    small: null
});

/**
 * Names for each stage render size
 * @enum {string}
 */
const STAGE_DISPLAY_SIZES = keyMirror({
    /**
     * Large stage with wide browser
     */
    large: null,

    /**
     * Large stage with narrow browser
     */
    largeConstrained: null,

    /**
     * Small stage (ignores browser width)
     */
    small: null
});

// zoom level to start with
const BLOCKS_DEFAULT_SCALE = 0.675;

const STAGE_DISPLAY_SCALES = {};
STAGE_DISPLAY_SCALES[STAGE_DISPLAY_SIZES.large] = 1; // large mode, wide browser (standard)
STAGE_DISPLAY_SCALES[STAGE_DISPLAY_SIZES.largeConstrained] = 0.85; // large mode but narrow browser
STAGE_DISPLAY_SCALES[STAGE_DISPLAY_SIZES.small] = 0.5; // small mode, regardless of browser size

// 官网 scratch 舞台区域宽高像素大小
const OFFICIAL_STAGE_WIDTH = 480;
const OFFICIAL_STAGE_HEIGHT = 360;

const STAGE_NATIVE_SIZES = [
    {
        width: 480,
        height: 360,
        title: '横版 4:3',
    },
    {
        width: 480,
        height: 800,
        title: '竖版',
    },
    {
        width: 1280,
        height: 720,
        title: '横版 16:9',
    },
];

export default {
    standardStageWidth: 480,
    standardStageHeight: 360,
    fullSizeMinWidth: 1096,
    fullSizePaintMinWidth: 1250
};

export {
    BLOCKS_DEFAULT_SCALE,
    STAGE_DISPLAY_SCALES,
    STAGE_DISPLAY_SIZES,
    STAGE_SIZE_MODES,

    STAGE_NATIVE_SIZES,
    OFFICIAL_STAGE_WIDTH,
    OFFICIAL_STAGE_HEIGHT,
};
