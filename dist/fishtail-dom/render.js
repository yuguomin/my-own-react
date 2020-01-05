"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SpecialChars_1 = require("./contants/SpecialChars");
/**
 * @description
 * 1. 相当于 ReactDOM.render 方法
 * 2. 递归的把传进来的 fishtail 元素创建成真实的 DOM tree，绑定每个元素的props中事件和属性
 * 3. 将 DOM tree 添加到 parentDom 中
 * @param { IFishtailElement } element 一个 fishtail 元素类型
 * @param { HTMLElement } parentDom 要渲染的目标 dom 元素
 * @return { undefined }
 */
exports.render = (element, parentDom) => {
    const { type, props } = element;
    const isTextELement = type === SpecialChars_1.TEXT_ELEMENT_TYPE;
    // 判断是文本节点还是元素节点，对应生成
    const dom = isTextELement ? document.createTextNode('') : document.createElement(type);
    // 判断是否是一个监听事件
    const isListener = (name) => name.startsWith(SpecialChars_1.EVENT_LISTENER_START);
    Object.keys(props).forEach((propName) => {
        if (isListener(propName)) {
            // 处理监听器绑定
            const listenerName = propName.toLowerCase().slice(2);
            dom.addEventListener(listenerName, props[propName]);
        }
        else if (propName !== 'children') {
            // 处理属性设置
            dom[propName] = props[propName];
        }
    });
    // 将子元素递归生成
    const childrenELements = props.children || [];
    childrenELements.forEach((child) => exports.render(child, dom));
    // 添加生成的 Dom tree 到根元素
    parentDom.appendChild(dom);
};
