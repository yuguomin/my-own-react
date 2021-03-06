import { IFishtailElementProps, IFishtailElement } from '../interface/IFishtailElement';
import { TEXT_ELEMENT_TYPE } from '../contants/SpecialChars';

/** 
 * @description
 * 相当于 React.createElement 方法
 * 1. 该方法的目的是把 JSX 被编译的东西，利用该方法转换成一个 fishtail 元素
 * 2. 转换出的 fishtail 元素将可以在 render 中调用继而渲染到页面
 * @param { string } type 元素类型
 * @param { IFishtailElementProps } config 元素的属性集合
 * @param { Array<IFishtailElement|string> } childrenList 子元素的列表
 * @return { IFishtailElement } 一个 fishtail 元素
*/
export const createElement:
  (type: string, config: IFishtailElementProps, ...childrenList: Array<IFishtailElement | string | null | false | undefined | number>)
    => IFishtailElement = (type, config, ...childrenList) => {
      const props = { ...config };
      const finalChlidren: IFishtailElement[] = [];
      // @ts-ignore
      const rawChildren = [].concat(...childrenList);
      rawChildren.forEach((children) => {
        if (children !== null && children !== false && children !== undefined) {
          if (!(children instanceof Object)) {
            children = createTextElement(children);
          }
          finalChlidren.push(children);
        }
      });
      props.children = finalChlidren;
      return { type, props }
    }

/** 
 * @description
 * 当处理 JSX 时，遇到 text 文案类型时，需要特殊创建
 * @param { string | number } nodeValue 文案内容
 * @return { IFishtailElement } 最终也是返回一个文案类型的 fishtaile 元素
 */
const createTextElement = (nodeValue: string | number) => {
  return createElement(TEXT_ELEMENT_TYPE, { nodeValue });
}
