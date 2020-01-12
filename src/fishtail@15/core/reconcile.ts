import { IFishtailInstance } from '../interface/IFishtailInstance';
import { IFishtailElement } from '../interface/IFishtailElement';
import { instantiate } from './instantiate';
import { updateDomProperties } from './updateDomProperties';
import { callClassComponentLifeCycle } from './component';
import { LifeCircleNameEnum } from '../contants/LifeCircleNameEnum'

/** 
 * @description
 * 做节点更新，节点(DOM和组件)复用的基础上的DOM变化，如节点增删改，以及属性变化
 * @param {Element | Text} parentDom 正在进行协调的节点的父容器节点
 * @param {IFishtailInstance | null | undefined} instance 正在协调的节点的实例数据，包括相关dom信息和VDOM描述及子节点信息
 * @param {IFishtailElement | undefined} element 正在协调节点的最新描述信息 VDOM
 * @return {IFishtailInstance | null} 最新的节点实例数据
 */
export const reconcile: (parentDom: Element | Text, instance: IFishtailInstance | null | undefined, element: IFishtailElement | undefined) => IFishtailInstance | null
  = (parentDom, instance, element) => {
    if (instance === null || instance === undefined) {
      if (element === undefined) { return null; } // <-------- 两个都没有就算了吧
      // 新增节点，做添加
      const newInstance = instantiate(element);
      callClassComponentLifeCycle(newInstance, LifeCircleNameEnum.willMount);
      parentDom.appendChild(newInstance.dom);
      callClassComponentLifeCycle(newInstance, LifeCircleNameEnum.didMount);
      return newInstance;
    } else if (element === undefined) {
      // 没有最新节点，做删除
      callClassComponentLifeCycle(instance, LifeCircleNameEnum.willUnmount);
      parentDom.removeChild(instance.dom);
      return null;
    } else if (instance.element.type !== element.type) {
      // 两边不同，都存在，做替换
      const newInstance = instantiate(element);
      callClassComponentLifeCycle(instance, LifeCircleNameEnum.willUnmount);
      callClassComponentLifeCycle(newInstance, LifeCircleNameEnum.willMount);
      parentDom.replaceChild(newInstance.dom, instance.dom);
      callClassComponentLifeCycle(newInstance, LifeCircleNameEnum.didMount);
      return newInstance;
    } else if (typeof element.type === 'string') {
      // 说明相同类型的type，可复用dom，继而修改原 dom 上的属性
      updateDomProperties(instance.dom, instance.element.props, element.props);
      instance.childInstances = reconcileChildren(instance, element);
      // dom 已更新至最新，Fishtail element保持同步
      instance.element = element;
      return instance;
    } else {
      const shouldUpdateStatus = callClassComponentLifeCycle(instance, LifeCircleNameEnum.shouldUpdate);
      if ([false, null, '', 0].includes(shouldUpdateStatus)) { return null; }
      callClassComponentLifeCycle(instance, LifeCircleNameEnum.willUpdate);
      let childElement: IFishtailElement;
      if (instance.publicInstance) {
        // 这一步实际上对修改了state的组件是没变化的，但是通过state绑定给子组件prop后，通过递归执行，子组件就能拿到最新的prop了
        instance.publicInstance.props = element.props;
        // 拿到组件最新的 element（因为既更新过state也更新过prop），这里通过render和state的改变都会变成新的element中
        childElement = instance.publicInstance.render();
      } else {
        // @ts-ignore
        childElement = element.type(element.props);
      }
      // 拿到过去的整个组件的子实例
      const oldChildInstance = instance.childInstance;
      // 对组件的前后状态做协调，最终打造新的一个 childInstance 更新，其实这里相当于把原先的rootInstance绑定在了组件自己内部
      // 组件最终会使用HTML型的element，所以会走到其它判断里，完成修改等操作
      const childInstance = reconcile(parentDom, oldChildInstance, childElement);
      if (!childInstance) { return null; }
      callClassComponentLifeCycle(instance, LifeCircleNameEnum.didUpdate);
      instance.dom = childInstance.dom; // 更新dom
      instance.childInstance = childInstance; // 更新childInstance
      instance.element = element; // 更新element
      return instance;
    }
  }

/** 
 * @description
 * 协调更新DOM节点的子节点信息，通过拿到最新的VDOM列表和之前的进行协调对比
 * @param {IFishtailInstance} 要更新其子节点的实例数据
 * @param {IFishtailElement} 要更新子节点的VDOM
 */
const reconcileChildren = (instance: IFishtailInstance, element: IFishtailElement) => {
  const { dom, childInstances = [] } = instance;
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