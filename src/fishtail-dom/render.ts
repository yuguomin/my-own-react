import { IFishtailElement, IFishtailElementProps } from './interface/IFishtailElement';
import { EVENT_LISTENER_START, TEXT_ELEMENT_TYPE } from './contants/SpecialChars';
import { IFishtailInstance } from './interface/IFishtailInstance';

let rootInstance: null | IFishtailInstance = null;
/** 
 * @description
 * 1. 相当于 ReactDOM.render 方法
 * 2. 递归的把传进来的 fishtail 元素创建成真实的 DOM tree，绑定每个元素的props中事件和属性
 * 3. 将 DOM tree 添加到 parentDom 中
 * @param { IFishtailElement } element 一个 fishtail 元素类型
 * @param { Element } parentDom 要渲染的目标 dom 元素
 * @return { undefined }
 */

export const render: (element: IFishtailElement, parentDom: Element | Text) => void = (element, parentDom) => {
  let prevInstance = rootInstance;
  let nextInstace = reconcile(parentDom, prevInstance, element);
  // 记录最新的 根节点 实例
  rootInstance = nextInstace;
}

// 根据不同情况协调两个 dom tree，并做不同方式的渲染
const reconcile: (container: Element | Text, instance: IFishtailInstance | null, element: IFishtailElement) => IFishtailInstance | null
  = (container, instance, element) => {
    if (instance === null || instance === undefined) {
      const newInstance = instantiate(element);
      container.appendChild(newInstance.dom);
      return newInstance;
    } else if (element === null || element === undefined) {
      container.removeChild(instance.dom);
      return null;
    } else if (instance.element.type === element.type) {
      updateDomProperties(instance.dom, instance.element.props, element.props);
      instance.childInstances = reconcileChildren(instance, element);
      instance.element = element;
      return instance;
    } else {
      const newInstance = instantiate(element);
      container.replaceChild(newInstance.dom, instance.dom);
      return newInstance;
    }
  }

// 将一个 fishtail 元素实例化成 fishtail instance 结构
const instantiate: (element: IFishtailElement) => IFishtailInstance = (element) => {
  const { type, props } = element;
  const isTextELement = type === TEXT_ELEMENT_TYPE;
  const dom = isTextELement ? document.createTextNode('') : document.createElement(type);

  updateDomProperties(dom, {}, props);

  const childELements = props.children || [];
  const childInstances = childELements.map(instantiate);
  childInstances.forEach((childrenInstance) => {
    dom.appendChild(childrenInstance.dom);
  });
  return { element, dom, childInstances }
}


const updateDomProperties = (dom: Element | Text, prevProps: IFishtailElementProps, nextProps: IFishtailElementProps) => {
  Object.keys(prevProps).forEach((propName) => {
    if (propName.startsWith(EVENT_LISTENER_START)) {
      const eventName = propName.toLowerCase().slice(2);
      dom.removeEventListener(eventName, prevProps[propName]);
    } else if (propName !== 'children') {
      dom[propName] = null;
    }
  });
  Object.keys(nextProps).forEach((propName) => {
    if (propName.startsWith(EVENT_LISTENER_START)) {
      const eventName = propName.toLowerCase().slice(2);
      dom.addEventListener(eventName, nextProps[propName]);
    } else if (propName !== 'children') {
      dom[propName] = nextProps[propName];
    }
  });
}

const reconcileChildren = (instance: IFishtailInstance, element: IFishtailElement) => {
  const { dom, childInstances } = instance;
  const nextChlidElements = element.props.children || [];
  const newChildInstances: Array<IFishtailInstance | null> = [];

  const count = Math.max(childInstances.length, nextChlidElements.length);
  for (let i = 0; i < count; i++) {
    const childInstance = childInstances[i];
    const childElement = nextChlidElements[i];
    const newChildInstance = reconcile(dom, childInstance, childElement);
    newChildInstances.push(newChildInstance);
  }
  return newChildInstances.filter(instance => instance != null);;
}





// export const render = (element: IFishtailElement, parentDom: Element | Text) => {
//   const { type, props } = element;
//   const isTextELement = type === TEXT_ELEMENT_TYPE;
//   // 判断是文本节点还是元素节点，对应生成
//   const dom = isTextELement ? document.createTextNode('') : document.createElement(type);
//   // 判断是否是一个监听事件
//   const isListener = (name: string) => name.startsWith(EVENT_LISTENER_START);
//   Object.keys(props).forEach((propName) => {
//     if (isListener(propName)) {
//       // 处理监听器绑定
//       const listenerName = propName.toLowerCase().slice(2);
//       dom.addEventListener(listenerName, props[propName]);
//     } else if (propName !== 'children') {
//       // 处理属性设置
//       dom[propName] = props[propName];
//     }
//   });
//   // 将子元素递归生成
//   const childrenELements = props.children || [];
//   childrenELements.forEach((child) => render(child, dom));
//   // 添加生成的 Dom tree 到根元素
//   parentDom.appendChild(dom);
// };