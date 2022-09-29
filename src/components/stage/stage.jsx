import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import Box from '../box/box.jsx';
import DOMElementRenderer from '../../containers/dom-element-renderer.jsx';
import Loupe from '../loupe/loupe.jsx';
import MonitorList from '../../containers/monitor-list.jsx';
import TargetHighlight from '../../containers/target-highlight.jsx';
import GreenFlagOverlay from '../../containers/green-flag-overlay.jsx';
import Question from '../../containers/question.jsx';
import MicIndicator from '../mic-indicator/mic-indicator.jsx';
import {STAGE_DISPLAY_SIZES} from '../../lib/layout-constants.js';
import {getStageDimensions} from '../../lib/screen-utils.js';
import styles from './stage.css';

const StageComponent = props => {
    const {
        canvas,
        dragRef,
        isColorPicking,
        isFullScreen,
        isStarted,
        colorInfo,
        micIndicator,
        question,
        stageSize,
        useEditorDragStyle,
        onDeactivateColorPicker,
        onDoubleClick,
        onQuestionAnswered,
        ...boxProps
    } = props;

    const stageDimensions = getStageDimensions(stageSize, isFullScreen);

    return (
        <React.Fragment>
            <Box
                className={classNames(
                    styles.stageWrapper,
                    {[styles.withColorPicker]: !isFullScreen && isColorPicking})}
                onDoubleClick={onDoubleClick}
            >
                <Box
                    className={classNames(
                        styles.stage,
                        {[styles.fullScreen]: isFullScreen}
                    )}
                    style={{
                        height: stageDimensions.height,
                        width: stageDimensions.width
                    }}
                >
                    <div
                        className={classNames(
                            styles.stageContainer,
                            // 下面这行决定了出现颜色选择器时的高亮位置
                            {[styles.withColorPicker]: !isFullScreen && isColorPicking},
                        )}
                    >
                        <DOMElementRenderer
                            domElement={canvas}
                            // style={{
                            //     height: stageDimensions.height,
                            //     width: stageDimensions.width
                            // }}
                            {...boxProps}
                        />
                        <Box className={styles.monitorWrapper}>
                            <MonitorList
                                draggable={useEditorDragStyle}
                                stageSize={stageDimensions}
                            />
                        </Box>
                        {/* TODO: 高亮的逻辑，如果用目前多个屏幕尺寸的方案，有问题，先隐藏 */}
                        {/* ![](http://res.watermcc.top/blog/2022/20220929-1664437207.png)
                        ![](http://res.watermcc.top/blog/2022/20220929-1664437223.png)
                        ![](http://res.watermcc.top/blog/2022/20220929-1664437238.png) */}
                        {/* <Box className={styles.frameWrapper}>
                            <TargetHighlight
                                className={styles.frame}
                                stageHeight={stageDimensions.height}
                                stageWidth={stageDimensions.width}
                            />
                        </Box> */}
                        {isColorPicking && colorInfo ? (
                            <Loupe colorInfo={colorInfo} />
                        ) : null}

                        {/* `stageOverlays` is for items that should *not* have their overflow contained within the stage */}
                        <Box
                            className={classNames(
                                styles.stageOverlays,
                                {[styles.fullScreen]: isFullScreen}
                            )}
                        >
                            <div
                                className={styles.stageBottomWrapper}
                                // style={{
                                //     width: stageDimensions.width,
                                //     height: stageDimensions.height
                                // }}
                            >
                                {micIndicator ? (
                                    <MicIndicator
                                        className={styles.micIndicator}
                                        // stageSize={stageDimensions}
                                    />
                                ) : null}
                                {question === null ? null : (
                                    <div
                                        className={styles.questionWrapper}
                                        // style={{width: stageDimensions.width}}
                                    >
                                        <Question
                                            question={question}
                                            onQuestionAnswered={onQuestionAnswered}
                                        />
                                    </div>
                                )}
                            </div>
                            <canvas
                                className={styles.draggingSprite}
                                height={0}
                                ref={dragRef}
                                width={0}
                            />
                        </Box>
                    </div>
                </Box>

                {isStarted ? null : (
                    <GreenFlagOverlay
                        className={styles.greenFlagOverlay}
                        wrapperClass={styles.greenFlagOverlayWrapper}
                    />
                )}
            </Box>
            {isColorPicking ? (
                <Box
                    className={styles.colorPickerBackground}
                    onClick={onDeactivateColorPicker}
                />
            ) : null}
        </React.Fragment>
    );
};
StageComponent.propTypes = {
    canvas: PropTypes.instanceOf(Element).isRequired,
    colorInfo: Loupe.propTypes.colorInfo,
    dragRef: PropTypes.func,
    isColorPicking: PropTypes.bool,
    isFullScreen: PropTypes.bool.isRequired,
    isStarted: PropTypes.bool,
    micIndicator: PropTypes.bool,
    onDeactivateColorPicker: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onQuestionAnswered: PropTypes.func,
    question: PropTypes.string,
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    useEditorDragStyle: PropTypes.bool,
};
StageComponent.defaultProps = {
    dragRef: () => {}
};
export default StageComponent;
