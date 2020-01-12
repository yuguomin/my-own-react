import { IFishtailInstance } from './IFishtailInstance';

export interface IFishtailElement {
  type: string | ((IFishtailElementProps) => IFishtailElement | void);
  props: IFishtailElementProps;
}

export interface IFishtailElementProps {
  [propName: string]: any;
  children?: IFishtailElement[];
}