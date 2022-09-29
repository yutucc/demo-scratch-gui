import bindAll from 'lodash.bindall';
import isEqual from 'lodash.isequal';
import PropTypes from 'prop-types';
import React from 'react';
import Renderer from 'scratch-render';
import VM from 'scratch-vm';
import {connect} from 'react-redux';
import { setSvgArtBoardWidthHeight } from 'scratch-paint';

import {STAGE_DISPLAY_SIZES} from '../lib/layout-constants';
import {getEventXY} from '../lib/touch-utils';
import VideoProvider from '../lib/video/video-provider';
import {BitmapAdapter as V2BitmapAdapter} from 'scratch-svg-renderer';

import StageComponent from '../components/stage/stage.jsx';

import { getStageDimensions } from '@/lib/screen-utils.js';
import { getShortSidePreferredSize } from '@/utils';

import {
    activateColorPicker,
    deactivateColorPicker
} from '../reducers/color-picker';

const colorPickerRadius = 20;
const dragThreshold = 3; // Same as the block drag threshold

class Stage extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'attachMouseEvents',
            'cancelMouseDownTimeout',
            'detachMouseEvents',
            'handleDoubleClick',
            'handleQuestionAnswered',
            'onMouseUp',
            'onMouseMove',
            'onMouseDown',
            'onStartDrag',
            'onStopDrag',
            'onWheel',
            'updateRect',
            'questionListener',
            'setDragCanvas',
            'clearDragCanvas',
            'drawDragCanvas',
            'positionDragCanvas',

            'onWindowResize',
            'resizeCanvas',
            'onStageNativeSizeChange',
        ]);

        this.state = {
            mouseDownTimeoutId: null,
            mouseDownPosition: null,
            isDragging: false,
            dragOffset: null,
            dragId: null,
            colorInfo: null,
            question: null
        };
        if (this.props.vm.renderer) {
            this.renderer = this.props.vm.renderer;
            this.canvas = this.renderer.canvas;
        } else {
            this.canvas = document.createElement('canvas');
            this.renderer = new Renderer(this.canvas);
            this.props.vm.attachRenderer(this.renderer);

            // Only attach a video provider once because it is stateful
            this.props.vm.setVideoProvider(new VideoProvider());

            // Calling draw a single time before any project is loaded just makes
            // the canvas white instead of solid black–needed because it is not
            // possible to use CSS to style the canvas to have a different
            // default color
            this.props.vm.renderer.draw();
        }
        this.props.vm.attachV2BitmapAdapter(new V2BitmapAdapter());
    }
    componentDidMount () {
        this.attachRectEvents();
        this.attachMouseEvents(this.canvas);
        this.updateRect();
        this.props.vm.runtime.addListener('QUESTION', this.questionListener);

        /* render 完后马上计算一下舞台和 canva 的尺寸 */
        this.resizeCanvas();
    }
    shouldComponentUpdate (nextProps, nextState) {
        return this.props.stageSize !== nextProps.stageSize ||
            this.props.isColorPicking !== nextProps.isColorPicking ||
            this.state.colorInfo !== nextState.colorInfo ||
            this.props.isFullScreen !== nextProps.isFullScreen ||
            this.state.question !== nextState.question ||
            this.props.micIndicator !== nextProps.micIndicator ||
            this.props.isStarted !== nextProps.isStarted ||
            !isEqual(this.props.stageNativeSize, nextProps.stageNativeSize);
    }
    componentDidUpdate (prevProps) {
        if (this.props.isColorPicking && !prevProps.isColorPicking) {
            this.startColorPickingLoop();
        } else if (!this.props.isColorPicking && prevProps.isColorPicking) {
            this.stopColorPickingLoop();
        }

        // 切换全屏模式时，重新计算舞台尺寸
        if (!isEqual(this.props.isFullScreen, prevProps.isFullScreen)) {
            this.resizeCanvas();
        }

        // 修改舞台尺寸时，执行这段逻辑
        if (!isEqual(this.props.stageNativeSize, prevProps.stageNativeSize)) {
            this.onStageNativeSizeChange();
        }

        this.updateRect();
        this.renderer.resize(this.rect.width, this.rect.height);
    }
    componentWillUnmount () {
        this.detachMouseEvents(this.canvas);
        this.detachRectEvents();
        this.stopColorPickingLoop();
        this.props.vm.runtime.removeListener('QUESTION', this.questionListener);
    }
    questionListener (question) {
        this.setState({question: question});
    }
    handleQuestionAnswered (answer) {
        this.setState({question: null}, () => {
            this.props.vm.runtime.emit('ANSWER', answer);
        });
    }
    startColorPickingLoop () {
        this.intervalId = setInterval(() => {
            if (typeof this.pickX === 'number') {
                this.setState({colorInfo: this.getColorInfo(this.pickX, this.pickY)});
            }
        }, 30);
    }
    stopColorPickingLoop () {
        clearInterval(this.intervalId);
    }
    attachMouseEvents (canvas) {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('touchmove', this.onMouseMove);
        document.addEventListener('touchend', this.onMouseUp);
        canvas.addEventListener('mousedown', this.onMouseDown);
        canvas.addEventListener('touchstart', this.onMouseDown);
        canvas.addEventListener('wheel', this.onWheel);
    }
    detachMouseEvents (canvas) {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('touchmove', this.onMouseMove);
        document.removeEventListener('touchend', this.onMouseUp);
        canvas.removeEventListener('mousedown', this.onMouseDown);
        canvas.removeEventListener('touchstart', this.onMouseDown);
        canvas.removeEventListener('wheel', this.onWheel);
    }
    attachRectEvents () {
        window.addEventListener('resize', this.updateRect);
        window.addEventListener('scroll', this.updateRect);

        // window.addEventListener('resize', this.onWindowResize);
    }
    detachRectEvents () {
        window.removeEventListener('resize', this.updateRect);
        window.removeEventListener('scroll', this.updateRect);

        // window.removeEventListener('resize', this.onWindowResize);
    }
    updateRect () {
        this.rect = this.canvas.getBoundingClientRect();
    }
    getScratchCoords (x, y) {
        const nativeSize = this.renderer.getNativeSize();
        return [
            (nativeSize[0] / this.rect.width) * (x - (this.rect.width / 2)),
            (nativeSize[1] / this.rect.height) * (y - (this.rect.height / 2))
        ];
    }
    getColorInfo (x, y) {
        return {
            x: x,
            y: y,
            ...this.renderer.extractColor(x, y, colorPickerRadius)
        };
    }
    handleDoubleClick (e) {
        const {x, y} = getEventXY(e);
        // Set editing target from cursor position, if clicking on a sprite.
        const mousePosition = [x - this.rect.left, y - this.rect.top];
        const drawableId = this.renderer.pick(mousePosition[0], mousePosition[1]);
        if (drawableId === null) return;
        const targetId = this.props.vm.getTargetIdForDrawableId(drawableId);
        if (targetId === null) return;
        this.props.vm.setEditingTarget(targetId);
    }
    onMouseMove (e) {
        const {x, y} = getEventXY(e);
        const mousePosition = [x - this.rect.left, y - this.rect.top];

        if (this.props.isColorPicking) {
            // Set the pickX/Y for the color picker loop to pick up
            this.pickX = mousePosition[0];
            this.pickY = mousePosition[1];
        }

        if (this.state.mouseDown && !this.state.isDragging) {
            const distanceFromMouseDown = Math.sqrt(
                Math.pow(mousePosition[0] - this.state.mouseDownPosition[0], 2) +
                Math.pow(mousePosition[1] - this.state.mouseDownPosition[1], 2)
            );
            if (distanceFromMouseDown > dragThreshold) {
                this.cancelMouseDownTimeout();
                this.onStartDrag(...this.state.mouseDownPosition);
            }
        }
        if (this.state.mouseDown && this.state.isDragging) {
            // Editor drag style only updates the drag canvas, does full update at the end of drag
            // Non-editor drag style just updates the sprite continuously.
            if (this.props.useEditorDragStyle) {
                this.positionDragCanvas(mousePosition[0], mousePosition[1]);
            } else {
                const spritePosition = this.getScratchCoords(mousePosition[0], mousePosition[1]);
                this.props.vm.postSpriteInfo({
                    x: spritePosition[0] + this.state.dragOffset[0],
                    y: -(spritePosition[1] + this.state.dragOffset[1]),
                    force: true
                });
            }
        }
        const coordinates = {
            x: mousePosition[0],
            y: mousePosition[1],
            canvasWidth: this.rect.width,
            canvasHeight: this.rect.height
        };
        this.props.vm.postIOData('mouse', coordinates);
    }
    onMouseUp (e) {
        const {x, y} = getEventXY(e);
        const mousePosition = [x - this.rect.left, y - this.rect.top];
        this.cancelMouseDownTimeout();
        this.setState({
            mouseDown: false,
            mouseDownPosition: null
        });
        const data = {
            isDown: false,
            x: x - this.rect.left,
            y: y - this.rect.top,
            canvasWidth: this.rect.width,
            canvasHeight: this.rect.height,
            wasDragged: this.state.isDragging
        };
        if (this.state.isDragging) {
            this.onStopDrag(mousePosition[0], mousePosition[1]);
        }
        this.props.vm.postIOData('mouse', data);

        if (this.props.isColorPicking &&
            mousePosition[0] > 0 && mousePosition[0] < this.rect.width &&
            mousePosition[1] > 0 && mousePosition[1] < this.rect.height
        ) {
            const {r, g, b} = this.state.colorInfo.color;
            const componentToString = c => {
                const hex = c.toString(16);
                return hex.length === 1 ? `0${hex}` : hex;
            };
            const colorString = `#${componentToString(r)}${componentToString(g)}${componentToString(b)}`;
            this.props.onDeactivateColorPicker(colorString);
            this.setState({colorInfo: null});
            this.pickX = null;
            this.pickY = null;
        }
    }
    onMouseDown (e) {
        this.updateRect();
        const {x, y} = getEventXY(e);
        const mousePosition = [x - this.rect.left, y - this.rect.top];
        if (this.props.isColorPicking) {
            // Set the pickX/Y for the color picker loop to pick up
            this.pickX = mousePosition[0];
            this.pickY = mousePosition[1];
            // Immediately update the color picker info
            this.setState({colorInfo: this.getColorInfo(this.pickX, this.pickY)});
        } else {
            if (e.button === 0 || (window.TouchEvent && e instanceof TouchEvent)) {
                this.setState({
                    mouseDown: true,
                    mouseDownPosition: mousePosition,
                    mouseDownTimeoutId: setTimeout(
                        this.onStartDrag.bind(this, mousePosition[0], mousePosition[1]),
                        400
                    )
                });
            }
            const data = {
                isDown: true,
                x: mousePosition[0],
                y: mousePosition[1],
                canvasWidth: this.rect.width,
                canvasHeight: this.rect.height
            };
            this.props.vm.postIOData('mouse', data);
            if (e.preventDefault) {
                // Prevent default to prevent touch from dragging page
                e.preventDefault();
                // But we do want any active input to be blurred
                if (document.activeElement && document.activeElement.blur) {
                    document.activeElement.blur();
                }
            }
        }
    }
    onWheel (e) {
        const data = {
            deltaX: e.deltaX,
            deltaY: e.deltaY
        };
        this.props.vm.postIOData('mouseWheel', data);
    }
    cancelMouseDownTimeout () {
        if (this.state.mouseDownTimeoutId !== null) {
            clearTimeout(this.state.mouseDownTimeoutId);
        }
        this.setState({mouseDownTimeoutId: null});
    }
    /**
     * Initialize the position of the "dragged sprite" canvas
     * @param {DrawableExtraction} drawableData The data returned from renderer.extractDrawableScreenSpace
     * @param {number} x The x position of the initial drag event
     * @param {number} y The y position of the initial drag event
     */
    drawDragCanvas (drawableData, x, y) {
        const {
            imageData,
            x: boundsX,
            y: boundsY,
            width: boundsWidth,
            height: boundsHeight
        } = drawableData;
        this.dragCanvas.width = imageData.width;
        this.dragCanvas.height = imageData.height;
        // On high-DPI devices, the canvas size in layout-pixels is not equal to the size of the extracted data.
        this.dragCanvas.style.width = `${boundsWidth}px`;
        this.dragCanvas.style.height = `${boundsHeight}px`;

        this.dragCanvas.getContext('2d').putImageData(imageData, 0, 0);
        // Position so that pick location is at (0, 0) so that  positionDragCanvas()
        // can use translation to move to mouse position smoothly.
        this.dragCanvas.style.left = `${boundsX - x}px`;
        this.dragCanvas.style.top = `${boundsY - y}px`;
        this.dragCanvas.style.display = 'block';
    }
    clearDragCanvas () {
        this.dragCanvas.width = this.dragCanvas.height = 0;
        this.dragCanvas.style.display = 'none';
    }
    positionDragCanvas (mouseX, mouseY) {
        // mouseX/Y are relative to stage top/left, and dragCanvas is already
        // positioned so that the pick location is at (0,0).
        this.dragCanvas.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }
    onStartDrag (x, y) {
        if (this.state.dragId) return;
        const drawableId = this.renderer.pick(x, y);
        if (drawableId === null) return;
        const targetId = this.props.vm.getTargetIdForDrawableId(drawableId);
        if (targetId === null) return;

        const target = this.props.vm.runtime.getTargetById(targetId);

        // Do not start drag unless in editor drag mode or target is draggable
        if (!(this.props.useEditorDragStyle || target.draggable)) return;

        // Dragging always brings the target to the front
        target.goToFront();

        const [scratchMouseX, scratchMouseY] = this.getScratchCoords(x, y);
        const offsetX = target.x - scratchMouseX;
        const offsetY = -(target.y + scratchMouseY);

        this.props.vm.startDrag(targetId);
        this.setState({
            isDragging: true,
            dragId: targetId,
            dragOffset: [offsetX, offsetY]
        });
        if (this.props.useEditorDragStyle) {
            // Extract the drawable art
            const drawableData = this.renderer.extractDrawableScreenSpace(drawableId);
            this.drawDragCanvas(drawableData, x, y);
            this.positionDragCanvas(x, y);
            this.props.vm.postSpriteInfo({visible: false});
            this.props.vm.renderer.draw();
        }
    }
    onStopDrag (mouseX, mouseY) {
        const dragId = this.state.dragId;
        const commonStopDragActions = () => {
            this.props.vm.stopDrag(dragId);
            this.setState({
                isDragging: false,
                dragOffset: null,
                dragId: null
            });
        };
        if (this.props.useEditorDragStyle) {
            // Need to sequence these actions to prevent flickering.
            const spriteInfo = {visible: true};
            // First update the sprite position if dropped in the stage.
            if (mouseX > 0 && mouseX < this.rect.width &&
                mouseY > 0 && mouseY < this.rect.height) {
                const spritePosition = this.getScratchCoords(mouseX, mouseY);
                spriteInfo.x = spritePosition[0] + this.state.dragOffset[0];
                spriteInfo.y = -(spritePosition[1] + this.state.dragOffset[1]);
                spriteInfo.force = true;
            }
            this.props.vm.postSpriteInfo(spriteInfo);
            // Then clear the dragging canvas and stop drag (potentially slow if selecting sprite)
            this.clearDragCanvas();
            commonStopDragActions();
            this.props.vm.renderer.draw();
        } else {
            commonStopDragActions();
        }
    }
    setDragCanvas (canvas) {
        this.dragCanvas = canvas;
    }

    /**
     * 目前舞台的最大宽高是不变的，不用执行这段函数
     * 如果再做得优化一点，把舞台的宽高变成是可以变的话，需要有这段逻辑
     */
    onWindowResize (event) {
        /* event.isTrusted
            true：非直接通过 “window.dispatchEvent(new Event('resize'));” 触发，属于用户调整窗口大小后触发的事件
            false：直接通过 “window.dispatchEvent(new Event('resize'));” 触发，目的是为了调整 block 编辑区域的大小 */
        if (event.isTrusted) {
            this.resizeCanvas();
        }
    }

    resizeCanvas (params) {
        const stageDimensions = getStageDimensions(this.props.stageSize, this.props.isFullScreen);

        const {
            stageWidth = stageDimensions.width,
            stageHeight = stageDimensions.height,
        } = params || {};
        const {
            stageNativeSize = [],
        } = this.props;
        const canvasSize = getShortSidePreferredSize(stageWidth, stageHeight, stageNativeSize[0], stageNativeSize[1]); // 通过短边优先占满的原则，算出在新舞台尺寸比例下 canvas 的 css 宽高

        this.canvas.style.width = `${canvasSize.width}px`;
        this.canvas.style.height = `${canvasSize.height}px`;
    }

    /**
     * 响应舞台尺寸改变时需要同步处理的操作
     */
     onStageNativeSizeChange () {
        const {
            stageNativeSize = [],
        } = this.props;
        console.log('stageNativeSize :>> ', stageNativeSize);
        const width = stageNativeSize[0];
        const height = stageNativeSize[1];

        const stageTarget = this.props.vm.runtime.getTargetForStage(); // 当前舞台 RenderTarget 对象
        const getCurrentCostume = stageTarget.getCurrentCostume(); // 当前舞台 RenderTarget 对象的当前装扮

        this.props.vm.runtime.setStageNativeSize(width, height); // 设置舞台的物理宽高，作为渲染时的实际宽高

        this.resizeCanvas();

        setSvgArtBoardWidthHeight(width, height); // 重新设置 paint 可编辑区域的宽高，并且重置与其相关的变量

        V2BitmapAdapter.setStageNativeSize([width, height]); // 设置 适配器的静态属性，记录当前的舞台尺寸，物理宽高

        // 目前舞台的最大宽高是不变的，不用执行这段函数。如果再做得优化一点，把舞台的宽高变成是可以变的话，需要有这段逻辑
        // window.dispatchEvent(new Event('resize')); // 用来调整 block 编辑区域的大小，避免因舞台区域大小的变化导致编辑区域多出一段空白

        if (!getCurrentCostume.originAsset) {
            return;
        }

        const bitmapAdapter = new V2BitmapAdapter();

        // 如果当前舞台 RenderTarget 对象的当前装扮中有 originAsset（背景原图的 asset 对象），则将原图适配当前尺寸后，更新到当前舞台 RenderTarget 对象的装扮中
        // bitmapAdapter.changeBackdropBitmap(getCurrentCostume.originAsset.data, getCurrentCostume.originAsset.assetType.contentType)
        // 不能直接用 getCurrentCostume.originAsset.assetType.contentType , 在 storage 的 src/AssetType.js 对于所有位图的 contentType 写死了 image/png， 不知道是故意这样写的还是 bug
        bitmapAdapter.changeBackdropBitmap(getCurrentCostume.originAsset.data, `image/${getCurrentCostume.originAsset.dataFormat}`)
            .then((imageData) => {
                this.props.vm.updateStageTargetBitmap(
                    stageTarget.currentCostume,
                    imageData,
                    imageData.width / 2,
                    imageData.height / 2,
                    2,
                    getCurrentCostume.originAsset.dataFormat
                );
            })
            .catch(() => {});
    }

    render () {
        const {
            vm, // eslint-disable-line no-unused-vars
            onActivateColorPicker, // eslint-disable-line no-unused-vars
            ...props
        } = this.props;
        return (
            <StageComponent
                canvas={this.canvas}
                colorInfo={this.state.colorInfo}
                dragRef={this.setDragCanvas}
                question={this.state.question}
                onDoubleClick={this.handleDoubleClick}
                onQuestionAnswered={this.handleQuestionAnswered}
                {...props}
            />
        );
    }
}

Stage.propTypes = {
    isColorPicking: PropTypes.bool,
    isFullScreen: PropTypes.bool.isRequired,
    isStarted: PropTypes.bool,
    micIndicator: PropTypes.bool,
    onActivateColorPicker: PropTypes.func,
    onDeactivateColorPicker: PropTypes.func,
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    useEditorDragStyle: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired
};

Stage.defaultProps = {
    useEditorDragStyle: true
};

const mapStateToProps = state => ({
    isColorPicking: state.scratchGui.colorPicker.active,
    isFullScreen: state.scratchGui.mode.isFullScreen,
    isStarted: state.scratchGui.vmStatus.started,
    micIndicator: state.scratchGui.micIndicator,
    // Do not use editor drag style in fullscreen or player mode.
    useEditorDragStyle: !(state.scratchGui.mode.isFullScreen || state.scratchGui.mode.isPlayerOnly),
    stageNativeSize: state.scratchGui.stageSize.stageNativeSize,
});

const mapDispatchToProps = dispatch => ({
    onActivateColorPicker: () => dispatch(activateColorPicker()),
    onDeactivateColorPicker: color => dispatch(deactivateColorPicker(color))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Stage);
