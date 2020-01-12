import { EVENT_LISTENER_START } from '../contants/SpecialChars';
import { IFishtailElementProps } from '../interface/IFishtailElement';

/** 
 * @description
 * 对比更新dom的属性和事件，核心是最终 dom 的属性要和 nextProps保持一致，但不要重复删除添加
 * @param {Element | Text} 要更新的dom节点
 * @param {IFishtailElementProps} 该节点之前的props数据
 * @param {IFishtailElementProps} 该节点最新的props数据
 */
export const updateDomProperties = (dom: Element | Text, prevProps: IFishtailElementProps, nextProps: IFishtailElementProps) => {
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