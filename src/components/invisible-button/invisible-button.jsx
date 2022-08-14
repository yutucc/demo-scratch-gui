/*
 * @Author: wuqinfa
 * @Date: 2022-05-25 10:37:36
 * @LastEditTime: 2022-08-14 16:36:32
 * @LastEditors: wuqinfa
 * @Description: 底部角色渲染栏，控制角色可见性的按钮
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import styles from './invisible-button.css';

import visibleIcon from './show.png';
import invisibleIcon from './hide.png';

const InvisibleButton = props => (
    <div
        aria-label="Invisible"
        className={classNames(
            styles.invisibleButton,
            props.className
        )}
        role="button"
        tabIndex={props.tabIndex}
        onClick={props.onClick}
    >
        <div className={styles.invisibleButtonVisible}>
            <img
                className={styles.invisibleIcon}
                src={props.isInvisible ? visibleIcon : invisibleIcon}
            />
        </div>
    </div>

);

InvisibleButton.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    tabIndex: PropTypes.number,
    isInvisible: PropTypes.bool.isRequired, // true：隐藏角色
};

InvisibleButton.defaultProps = {
    tabIndex: 0
};

export default InvisibleButton;
