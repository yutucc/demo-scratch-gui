/*
 * @Author: wuqinfa
 * @Date: 2022-06-20 10:26:16
 * @LastEditTime: 2022-09-29 15:50:59
 * @LastEditors: wuqinfa
 * @Description:
 */
import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import VM from 'scratch-vm';
import {STAGE_SIZE_MODES} from '../lib/layout-constants';
import {setStageSize} from '../reducers/stage-size';
import {setFullScreen} from '../reducers/mode';
import {
    setStageNativeSize,
} from '../reducers/stage-size';

import {connect} from 'react-redux';

import StageHeaderComponent from '../components/stage-header/stage-header.jsx';

// eslint-disable-next-line react/prefer-stateless-function
class StageHeader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleKeyPress',
            'handleTriggerCoordinate',
            'handleZoomOutCoordinateFontSize',
            'handleZoomInCoordinateFontSize',
            'handleOpenStageNativeSizePopover',
            'handleCloseStageNativeSizePopover',
        ]);

        this.minCoordinateFontSize = 10;
        this.maxCoordinateFontSize = 18;
        this.coordinateFontSize = 14;

        this.state = {
            isShowCoordinate: false, // 是否显示坐标网格
            stageNativeSizePopoverOpen: false,
        };
    }
    componentDidMount () {
        document.addEventListener('keydown', this.handleKeyPress);
    }
    componentWillUnmount () {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    handleKeyPress (event) {
        if (event.key === 'Escape' && this.props.isFullScreen) {
            this.props.onSetStageUnFull(false);
        }
    }

    /**
     * 触发坐标网格的显示 or 隐藏
     */
     handleTriggerCoordinate () {
        const visible = !this.state.isShowCoordinate;

        this.props.vm.runtime.triggerCoordinate(visible);

        this.setState({
            isShowCoordinate: visible
        });
    }

    /**
     * 缩小坐标系的字体
     */
     handleZoomOutCoordinateFontSize () {
        let temp = this.coordinateFontSize - 1;

        temp = temp >= this.minCoordinateFontSize ? temp : this.minCoordinateFontSize;
        console.log('temp :>> ', temp);

        this.coordinateFontSize = temp;
        this.props.vm.runtime.setCoordinateFontSize(temp);
    }

    /**
     * 放大坐标系的字体
     */
     handleZoomInCoordinateFontSize () {
        let temp = this.coordinateFontSize + 1;

        temp = temp <= this.maxCoordinateFontSize ? temp : this.maxCoordinateFontSize;

        this.coordinateFontSize = temp;
        this.props.vm.runtime.setCoordinateFontSize(temp);
    }

    /**
     * 打开 stageNativeSize 的 Popover 组件
     */
    handleOpenStageNativeSizePopover () {
        this.setState({stageNativeSizePopoverOpen: true});
    }

    /**
     * 关闭 stageNativeSize 的 Popover 组件
     */
    handleCloseStageNativeSizePopover () {
        this.setState({stageNativeSizePopoverOpen: false});
    }

    render () {
        const {
            ...props
        } = this.props;
        return (
            <StageHeaderComponent
                {...props}
                isShowCoordinate={this.state.isShowCoordinate}
                onKeyPress={this.handleKeyPress}
                onTriggerCoordinate={this.handleTriggerCoordinate}
                onZoomOutCoordinateFontSize={this.handleZoomOutCoordinateFontSize}
                onZoomInCoordinateFontSize={this.handleZoomInCoordinateFontSize}

                stageNativeSizePopoverOpen={this.state.stageNativeSizePopoverOpen}
                onOpenStageNativeSizePopover={this.handleOpenStageNativeSizePopover}
                onCloseStageNativeSizePopover={this.handleCloseStageNativeSizePopover}
            />
        );
    }
}

StageHeader.propTypes = {
    isFullScreen: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    onSetStageUnFull: PropTypes.func.isRequired,
    showBranding: PropTypes.bool,
    stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
    vm: PropTypes.instanceOf(VM).isRequired,

    stageNativeSize: PropTypes.array.isRequired,
    onSetStageNativeSize: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    stageSizeMode: state.scratchGui.stageSize.stageSize,
    showBranding: state.scratchGui.mode.showBranding,
    isFullScreen: state.scratchGui.mode.isFullScreen,
    isPlayerOnly: state.scratchGui.mode.isPlayerOnly,

    stageNativeSize: state.scratchGui.stageSize.stageNativeSize, // 当前舞台尺寸
});

const mapDispatchToProps = dispatch => ({
    onSetStageLarge: () => dispatch(setStageSize(STAGE_SIZE_MODES.large)),
    onSetStageSmall: () => dispatch(setStageSize(STAGE_SIZE_MODES.small)),
    onSetStageFull: () => dispatch(setFullScreen(true)),
    onSetStageUnFull: () => dispatch(setFullScreen(false)),

    onSetStageNativeSize: (stageNativeSize) => dispatch(setStageNativeSize(stageNativeSize)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StageHeader);
