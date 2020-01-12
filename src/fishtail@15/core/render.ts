import { IFishtailElement } from '../interface/IFishtailElement';
import { IFishtailInstance } from '../interface/IFishtailInstance';
import { reconcile } from './reconcile';

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
  const prevInstance = rootInstance;
  const nextInstace = reconcile(parentDom, prevInstance, element);
  // 记录最新的 根节点 实例
  rootInstance = nextInstace;
}
