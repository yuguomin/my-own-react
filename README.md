# my-own-react

1. 实现基本的Fishtail.Element数据结构
实际结构主要就是两部分组成，第一个是`type`，然后是`props`

```TypeScript
interface IFishtailElement {
  type: string;
  props: IProps;
}
interface IProps {
  children?: IFishtailElement[];
  [propName: string]: any;
}
```