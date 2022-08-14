/*
 * @Author: wuqinfa
 * @Date: 2022-05-25 10:09:00
 * @LastEditTime: 2022-08-14 15:35:27
 * @LastEditors: wuqinfa
 * @Description: 定义角色拥有的权限值、校验是否拥有特定权限
 */
import authority from '@/lib/authority';

/**
 * 定义角色以及角色拥有的权限值
 */
export const roles = {
    student: [],
    teacher: [
        authority.spriteVisibility,
        authority.copyProjectURL,
    ],
};

/**
 * 验证角色是否存在目标权限
 * @param {String} role 角色标识
 * @param {String} targetAuth authority.js 中定义的权限
 * @returns {boolean} true：有权限；false：无权限
 */
export const verifyAuth = (role, targetAuth) => {
    return roles[role] && roles[role].includes(targetAuth);
}
