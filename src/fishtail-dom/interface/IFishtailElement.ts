export interface IFishtailElement {
  type: string;
  props: IFishtailElementProps;
}

export interface IFishtailElementProps {
  [propName: string]: any;
  children?: IFishtailElement[];
}