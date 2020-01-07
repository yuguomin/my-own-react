# my-own-react

1. 实现基本的 Fishtail.Element 数据结构和 Fishtail.render 方法
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
FishtailDOM.render 方法相当于 ReactDOM.render 方法，将最终的 DOM Tree 添加到目标节点中。


2. 实现Fishtail.createElement方法，通过该方法，可以生成Fishtail需要的元素
在编译JSX时，指定对应的JSX结构方法，即可使用。

```JavaScript
/** @jsx Fishtail.createElement */
const element = (
  <div id="container">
    <input value="foo" type="text" />
    <a href="/bar">bar</a>
    <span onClick={e => alert("Hi")}>click me</span>
  </div>
);
```
会被如 babel 解析为
```JavaScript
/** @jsx Fishtail.createElement */
const element = Fishtail.createElement("div", {
  id: "container"
}, Fishtail.createElement("input", {
  value: "foo",
  type: "text"
}), Fishtail.createElement("a", {
  href: "/bar"
}, "bar"), Fishtail.createElement("span", {
  onClick: e => alert("Hi")
}, "click me"));
```
所以当接收到这个解析结果的参数后，通过该方法要得到一个完整的 Fishtail Root Element，需要注意对于 null undefined false的值不渲染，已经文本节点的生成。

3. 实现VDom的效果，vdom