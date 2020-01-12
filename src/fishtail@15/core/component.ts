import { IFishtailElement } from '../interface/IFishtailElement';
import { IFishtailInstance } from '../interface/IFishtailInstance';
import { LifeCircleNameEnum } from '../contants/LifeCircleNameEnum';
import { reconcile } from './reconcile';

/** 
 * @description
 * 类组件的基础抽象类，实现基本的一些功能配置：
 * 1. props和state绑定
 * 2. setState更新状态
 * 3. 定义render抽象类方法
 */
export abstract class Component {
  constructor(props) {
    this.props = props;
    this.state = this.state;
  }
  public props = {};
  public state = {};
  public __internalInstance: IFishtailInstance;

  public setState(modifieState) {
    this.state = Object.assign(this.state, modifieState);
    updateInstance(this.__internalInstance);
  }
  abstract render(): IFishtailElement;
}

/** 
 * @description
 * 调用组件实例生命周期的方法
 * @param {instance} instance 组件实例数据
 * @param {} lifecycleName 生命周期方法名
 */
export const callClassComponentLifeCycle = (instance: IFishtailInstance, lifecycleName: LifeCircleNameEnum) =>  {
  if (instance && instance.publicInstance) {
    if (instance.publicInstance[lifecycleName]) {
      return instance.publicInstance[lifecycleName]();
    }
  }
}

/** 
 * @description
 * 通过实例上的内部实例数据，调用协调更新组件显示
 * @param {internalInstance} 组件内部实例数据
 */
const updateInstance = (internalInstance) => {
  const parentDom = internalInstance.dom.parentNode;
  const element = internalInstance.element;
  reconcile(parentDom, internalInstance, element);
}
