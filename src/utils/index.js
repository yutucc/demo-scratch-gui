import {BitmapAdapter} from 'scratch-svg-renderer';

/*
 * @Author: wuqinfa
 * @Date: 2022-09-23 17:13:01
 * @LastEditors: wuqinfa
 * @Description:
 */
/**
 * 根据背景的原图，通过 BitmapAdapter 生成适配多种舞台尺寸的图片上传到七牛
 * @param {Object} originAsset storage库的 Asset 对象
 */
 export const uploadBackdropToQiniu = function(originAsset) {
    const bitmapAdapter = new BitmapAdapter();

    bitmapAdapter.adaptiveMoreStageNativeSizeBackdropBitmap(originAsset, STAGE_NATIVE_SIZES)
        .then((files) => {
            // files 返回了适配多种舞台尺寸的图片已经原图 的 File 对象数组
            files.forEach((item) => {
                // PS：这个是自己定义，将图片上传到七牛云的函数，这个 Demo 项目里面木有实现，读者可以自己实现这个函数
                // qiniuUploader.upload(item, item.name);
            });
        });
}

/**
 * 短边优先占满，长边根据比例缩放
 *  比如：
 *      refWidth = 452，refHeight = 753
 *      targetWidth = 960，targetHeight = 720
 *      优先填满 refWidth（短边），即返回的 width = 452，套用下面的公式，可以算出 返回的 height = 339
 *      效果可以参考：
 *          http://res.watermcc.top/blog/2022/20220929-1664438333.png
 * @param {number} refWidth 参考的宽
 * @param {number} refHeight 参考的高
 * @param {number} targetWidth 目标的宽
 * @param {number} targetHeight 目标的高
 * @returns {object} {width, height}
 */
 export const getShortSidePreferredSize = (refWidth, refHeight, targetWidth, targetHeight) => {
    const refRatio = refWidth / refHeight;
    const targetRatio = targetWidth / targetHeight;

    if (targetRatio >= refRatio) {
        return {
            width: refWidth,
            height: Math.round(refWidth / targetRatio),
        };
    }

    return {
        width: Math.round(refHeight * targetRatio),
        height: refHeight,
    };
};
