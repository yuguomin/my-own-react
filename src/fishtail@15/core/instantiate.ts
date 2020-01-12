import { IFishtailElement } from '../interface/IFishtailElement';
import { TEXT_ELEMENT_TYPE } from '../contants/SpecialChars';
import { updateDomProperties } from './updateDomProperties';
import { IFishtailInstance } from '../interface/IFishtailInstance';
import { Component } from './component';
// import { IFishtailInstance } from "./interface/IFishtailInstance";

/**
 * @description
 * 将传进来的VDOM进行实例化，实例化实际上就是把VDOM和真实DOM进行映射，方便操作
 * @param {IFishtailElement} element 想要实例化的VDOM，可能是DOM节点的也可能是类组件或者函数组件
 * @return {IFishtailInstance} element实例化后的内容
 */
export const instantiate: (element: IFishtailElement) => IFishtailInstance = (element) => {
  const { type, props } = element;
  if (typeof type === 'string') {
    // HTML节点
    const isTextELement = type === TEXT_ELEMENT_TYPE;
    const dom = isTextELement ? document.createTextNode('') : document.createElement(type);

    updateDomProperties(dom, {}, props);

    const childELements = props.children || [];
    // 这里通过递归不断拿到下面每一层的 instance 结构，再通过后面的 append 操作生成出完整的 DOM 树
    const childInstances = childELements.map(instantiate);
    childInstances.forEach((childrenInstance) => {
      dom.appendChild(childrenInstance.dom);
    });
    return { element, dom, childInstances }
  } else if (type.prototype instanceof Component) {
    // 类组件
    const instance = {} as IFishtailInstance;
    const publicInstance = createPublicInstance(element, instance); // 创建组件实例对象
    const childElement = publicInstance.render(); // 执行实例上的render方法
    const childInstance = instantiate(childElement); // 递归拿到子实例
    const { dom } = childInstance; // 拿到整个dom
    Object.assign(instance, { dom, element, childInstance, publicInstance });
    return instance;
  } else {
    // 函数组件
    const childElement = type(props);
    // @ts-ignore
    const childInstance = instantiate(childElement);
    const { dom } = childInstance;
    return { dom, element, childInstance }
  }
}

/** 
 * @description
 * 生成类组件的对应公共实例，并且将该组件的instance数据绑定在实例上
 * @param {IFishtailElement} element 
 */
const createPublicInstance = (element: IFishtailElement, internalInstance: IFishtailInstance) => {
  const { type, props } = element;
  if (typeof type !== 'string') {
    // @ts-ignore
    const publicInstance = new type(props);
    publicInstance.__internalInstance = internalInstance;
    return publicInstance;
  }
}