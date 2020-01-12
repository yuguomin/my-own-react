import { render } from './core/render'
import { createElement } from './core/createElement';
import { Component } from './core/component';

const Fishtail = {
  render,
  createElement,
  Component
}

declare global {
  interface Window {
    Fishtail: any;
  }
}
// 最终打包的文件引入后可通过 Fishtail 全局变量使用
window.Fishtail = Fishtail;