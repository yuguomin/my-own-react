import { render } from './fishtail-dom/render'
import { createElement } from './fishtail-dom/createElement';

const Fishtail = {
  render,
  createElement
}

declare global {
  interface Window {
    Fishtail: any;
  }
}

window.Fishtail = Fishtail;