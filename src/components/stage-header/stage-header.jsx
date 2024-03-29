import classNames from 'classnames';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import VM from 'scratch-vm';
import Popover from 'react-popover';
import isEqual from 'lodash.isequal';

import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import Controls from '../../containers/controls.jsx';
import {getStageDimensions} from '../../lib/screen-utils';
import { STAGE_SIZE_MODES, STAGE_NATIVE_SIZES } from '../../lib/layout-constants';

import fullScreenIcon from './icon--fullscreen.svg';
// import largeStageIcon from './icon--large-stage.svg';
// import smallStageIcon from './icon--small-stage.svg';
import unFullScreenIcon from './icon--unfullscreen.svg';
import stageSizeIcon from './stageSize.svg';

import scratchLogo from '../menu-bar/scratch-logo.svg';
import styles from './stage-header.css';

const messages = defineMessages({
    largeStageSizeMessage: {
        defaultMessage: 'Switch to large stage',
        description: 'Button to change stage size to large',
        id: 'gui.stageHeader.stageSizeLarge'
    },
    smallStageSizeMessage: {
        defaultMessage: 'Switch to small stage',
        description: 'Button to change stage size to small',
        id: 'gui.stageHeader.stageSizeSmall'
    },
    fullStageSizeMessage: {
        defaultMessage: 'Enter full screen mode',
        description: 'Button to change stage size to full screen',
        id: 'gui.stageHeader.stageSizeFull'
    },
    unFullStageSizeMessage: {
        defaultMessage: 'Exit full screen mode',
        description: 'Button to get out of full screen mode',
        id: 'gui.stageHeader.stageSizeUnFull'
    },
    fullscreenControl: {
        defaultMessage: 'Full Screen Control',
        description: 'Button to enter/exit full screen mode',
        id: 'gui.stageHeader.fullscreenControl'
    }
});

const StageHeaderComponent = function (props) {
    const {
        isFullScreen,
        isPlayerOnly,
        onKeyPress,
        onSetStageLarge,
        onSetStageSmall,
        onSetStageFull,
        onSetStageUnFull,
        showBranding,
        stageSizeMode,
        vm,

        isShowCoordinate,
        onTriggerCoordinate,
        onZoomOutCoordinateFontSize,
        onZoomInCoordinateFontSize,

        stageNativeSize,
        onSetStageNativeSize,
        stageNativeSizePopoverOpen,
        onOpenStageNativeSizePopover,
        onCloseStageNativeSizePopover,
    } = props;

    let header = null;

    const stageNativeSizePopoverBody = (
        <div className={styles.stageNativeSize}>
            {
                STAGE_NATIVE_SIZES.map((item) => {
                    const {
                        width,
                        height,
                        title,
                    } = item;
                    const isCurSel = isEqual(stageNativeSize, [width, height]);

                    return (
                        <div
                            key={`key_${width}_${height}`}
                            className={classNames(
                                styles.stageNativeSizeButton,
                                {
                                    [styles['stageNativeSizeButton--sel']]: isCurSel,
                                }
                            )}
                            onClick={() => {
                                onSetStageNativeSize([width, height]);
                            }}
                        >
                            {title}
                        </div>
                    );
                })
            }
        </div>
    );

    if (isFullScreen) {
        const stageDimensions = getStageDimensions(null, true);
        const stageButton = showBranding ? (
            <div className={styles.embedScratchLogo}>
                <a
                    href="https://scratch.mit.edu"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <img
                        alt="Scratch"
                        src={scratchLogo}
                    />
                </a>
            </div>
        ) : (
            <Button
                className={styles.stageButton}
                onClick={onSetStageUnFull}
                onKeyPress={onKeyPress}
            >
                <img
                    alt={props.intl.formatMessage(messages.unFullStageSizeMessage)}
                    className={styles.stageButtonIcon}
                    draggable={false}
                    src={unFullScreenIcon}
                    title={props.intl.formatMessage(messages.fullscreenControl)}
                />
            </Button>
        );
        header = (
            <Box className={styles.stageHeaderWrapperOverlay}>
                <Box
                    className={styles.stageMenuWrapper}
                    style={{width: stageDimensions.width}}
                >
                    <Controls vm={vm} />
                    {stageButton}
                </Box>
            </Box>
        );
    } else {
        const stageControls =
            isPlayerOnly ? (
                []
            ) : (
                <div className={styles.stageSizeToggleGroup}>
                    <div>
                        <span className={styles.btn} onClick={onTriggerCoordinate}>{isShowCoordinate ? '关闭坐标' : '开启坐标'}</span>
                        {
                            isShowCoordinate ? (
                                <>
                                    <span className={styles.btn} onClick={onZoomOutCoordinateFontSize}>缩小字体</span>
                                    <span className={styles.btn} onClick={onZoomInCoordinateFontSize}>放大字体</span>
                                </>
                            ) : null
                        }
                    </div>

                    {/* 新增 stageNativeSize 的 Popover 组件，用于选择舞台尺寸，如图： ![](http://res.watermcc.top/blog/2022/20220929-1664437753.png) */}
                    <Popover
                        className="custom-popover"
                        body={stageNativeSizePopoverBody}
                        isOpen={stageNativeSizePopoverOpen}
                        preferPlace="below"
                        onOuterAction={onCloseStageNativeSizePopover}
                    >
                        <div>
                            <Button
                                className={styles.stageButton}
                                onClick={onOpenStageNativeSizePopover}
                            >
                                <img
                                    className={styles.stageButtonIcon}
                                    draggable={false}
                                    src={stageSizeIcon}
                                />
                            </Button>
                        </div>
                    </Popover>

                    {/* FIXME: 原本用于等比例放大缩小舞台尺寸的功能就先注释掉 */}
                    {/* <div>
                        <Button
                            className={classNames(
                                styles.stageButton,
                                styles.stageButtonFirst,
                                (stageSizeMode === STAGE_SIZE_MODES.small) ? null : styles.stageButtonToggledOff
                            )}
                            onClick={onSetStageSmall}
                        >
                            <img
                                alt={props.intl.formatMessage(messages.smallStageSizeMessage)}
                                className={styles.stageButtonIcon}
                                draggable={false}
                                src={smallStageIcon}
                            />
                        </Button>
                    </div>
                    <div>
                        <Button
                            className={classNames(
                                styles.stageButton,
                                styles.stageButtonLast,
                                (stageSizeMode === STAGE_SIZE_MODES.large) ? null : styles.stageButtonToggledOff
                            )}
                            onClick={onSetStageLarge}
                        >
                            <img
                                alt={props.intl.formatMessage(messages.largeStageSizeMessage)}
                                className={styles.stageButtonIcon}
                                draggable={false}
                                src={largeStageIcon}
                            />
                        </Button>
                    </div> */}
                </div>
            );
        header = (
            <Box className={styles.stageHeaderWrapper}>
                <Box className={styles.stageMenuWrapper}>
                    <Controls vm={vm} />
                    <div className={styles.stageSizeRow}>
                        {stageControls}
                        <div>
                            <Button
                                className={styles.stageButton}
                                onClick={onSetStageFull}
                            >
                                <img
                                    alt={props.intl.formatMessage(messages.fullStageSizeMessage)}
                                    className={styles.stageButtonIcon}
                                    draggable={false}
                                    src={fullScreenIcon}
                                    title={props.intl.formatMessage(messages.fullscreenControl)}
                                />
                            </Button>
                        </div>
                    </div>
                </Box>
            </Box>
        );
    }

    return header;
};

const mapStateToProps = state => ({
    // This is the button's mode, as opposed to the actual current state
    stageSizeMode: state.scratchGui.stageSize.stageSize
});

StageHeaderComponent.propTypes = {
    intl: intlShape,
    isFullScreen: PropTypes.bool.isRequired,
    isPlayerOnly: PropTypes.bool.isRequired,
    onKeyPress: PropTypes.func.isRequired,
    onSetStageFull: PropTypes.func.isRequired,
    onSetStageLarge: PropTypes.func.isRequired,
    onSetStageSmall: PropTypes.func.isRequired,
    onSetStageUnFull: PropTypes.func.isRequired,
    showBranding: PropTypes.bool.isRequired,
    stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
    vm: PropTypes.instanceOf(VM).isRequired,

    isShowCoordinate: PropTypes.bool.isRequired, // 标识是否显示网格坐标
    onTriggerCoordinate: PropTypes.func.isRequired, // 控制是否显示网格坐标
    onZoomOutCoordinateFontSize: PropTypes.func.isRequired, // 缩小网格坐标系的字体大小
    onZoomInCoordinateFontSize: PropTypes.func.isRequired, // 放大网格坐标系的字体大小

    stageNativeSize: PropTypes.array.isRequired, // 当前舞台尺寸
    onSetStageNativeSize: PropTypes.func.isRequired, // 设置当前舞台尺寸
    stageNativeSizePopoverOpen: PropTypes.bool.isRequired, // 用来控制 stageNativeSize 的 Popover 组件是否显示
    onOpenStageNativeSizePopover: PropTypes.func.isRequired, // 打开 stageNativeSize 的 Popover 组件
    onCloseStageNativeSizePopover: PropTypes.func.isRequired, // 关闭 stageNativeSize 的 Popover 组件
};

StageHeaderComponent.defaultProps = {
    stageSizeMode: STAGE_SIZE_MODES.large
};

export default injectIntl(connect(
    mapStateToProps
)(StageHeaderComponent));
