import { IFishtailElement, IFishtailElementProps } from './interface/IFishtailElement';
import { EVENT_LISTENER_START, TEXT_ELEMENT_TYPE } from './contants/SpecialChars';
import { IFishtailInstance } from './interface/IFishtailInstance';

// 保存最新的根节点Instance数据
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
const reconcile: (parentDom: Element | Text, instance: IFishtailInstance | null | undefined, element: IFishtailElement | undefined) => IFishtailInstance | null
  = (parentDom, instance, element) => {
    if (instance === null || instance === undefined) {
      if (element === undefined) { return null; } // <-------- 两个都没有就算了吧
      // 新增节点，做添加
      const newInstance = instantiate(element);
      parentDom.appendChild(newInstance.dom);
      return newInstance;
    } else if (element === undefined) {
      // 当props.children较短时，element出现undefined实际上就是需要删除
      parentDom.removeChild(instance.dom);
      return null;
    } else if (instance.element.type === element.type) {
      // 说明相同类型的type，可复用dom，继而修改原 dom 上的属性
      updateDomProperties(instance.dom, instance.element.props, element.props);
      instance.childInstances = reconcileChildren(instance, element);
      // dom 已更新至最新，Fishtail element保持同步
      instance.element = element;
      return instance;
    } else {
      // 两边不同，都存在，做替换
      const newInstance = instantiate(element);
      parentDom.replaceChild(newInstance.dom, instance.dom);
      return newInstance;
    }
  }

// 将一个 fishtail 元素实例化成 fishtail instance 结构
const instantiate: (element: IFishtailElement) => IFishtailInstance = (element) => {
  const { type, props } = element;
  const isTextELement = type === TEXT_ELEMENT_TYPE;
  const dom = isTextELement ? document.createTextNode('') : document.createElement(type);
  // 抽离属性添加，加入对比层，供复用 dom 的场景下复用方法
  updateDomProperties(dom, {}, props);

  const childELements = props.children || [];
  // 这里通过递归不断拿到下面每一层的 instance 结构，再通过后面的 append 操作生成出完整的 DOM 树
  const childInstances = childELements.map(instantiate);
  childInstances.forEach((childrenInstance) => {
    dom.appendChild(childrenInstance.dom);
  });
  return { element, dom, childInstances }
}

// 对比更新dom的属性和事件，核心是最终 dom 的属性要和 nextProps保持一致，但不要重复删除添加
const updateDomProperties = (dom: Element | Text, prevProps: IFishtailElementProps, nextProps: IFishtailElementProps) => {
  const isNew = (prev, next) => key =>
    prev[key] !== next[key];
  Object.keys(prevProps).forEach((propName) => {
    // 判断这个属性是不是被删除或者被修改
    if (!(propName in nextProps) || isNew(prevProps, nextProps)(propName)) {
      if (propName.startsWith(EVENT_LISTENER_START)) {
        const eventName = propName.toLowerCase().slice(2);
        dom.removeEventListener(eventName, prevProps[propName]);
      } else if (propName !== 'children') {
        dom[propName] = null;
      }
    }
  });
  Object.keys(nextProps).forEach((propName) => {
    // 判断这个属性是否为新增或者更新
    if (isNew(prevProps, nextProps)(propName)) {
      if (propName.startsWith(EVENT_LISTENER_START)) {
        const eventName = propName.toLowerCase().slice(2);
        dom.addEventListener(eventName, nextProps[propName]);
      } else if (propName !== 'children') {
        dom[propName] = nextProps[propName];
      }
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
    // 递归上一层的 reconcile 方法，实现深度 reconcile
    const newChildInstance = reconcile(dom, childInstance, childElement);
    newChildInstances.push(newChildInstance);
  }
  return newChildInstances.filter(instance => instance !== null && instance !== undefined);
}
