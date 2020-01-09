import { render } from './render'
import { createElement } from './createElement';

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