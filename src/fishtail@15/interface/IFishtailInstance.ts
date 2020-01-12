import { IFishtailElement } from './IFishtailElement';

export interface IFishtailInstance {
  element: IFishtailElement;
  dom: Element | Text;
  childInstances?: Array<IFishtailInstance | null>;
  childInstance?: IFishtailInstance | null;
  publicInstance?: any;
}