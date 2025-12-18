import { Matrix } from 'pixi.js';
import { IPaint } from './style';
import { nanoid } from 'nanoid';

export type PrimitiveType =
  | 'Unknown'
  | 'Rect'
  | 'Ellipse'
  | 'Frame'
  | 'Layer'
  | 'Transformer'
  | 'Picture'
  | 'Text'
  | 'Line';

export const PrimitiveMap: Record<PrimitiveType, PrimitiveType> = {
  Unknown: 'Unknown',
  Rect: 'Rect',
  Ellipse: 'Ellipse',
  Frame: 'Frame',
  Layer: 'Layer',
  Transformer: 'Transformer',
  Picture: 'Picture',
  Text: 'Text',
  Line: 'Line',
} as const;

export const SIZE_PROPS = ['w', 'h'];

export const STYLE_PROPS = ['fills', 'strokes'];

export interface IPrimitive {
  // uuid, 对象的唯一id
  readonly uuid: string;
  // 节点类型
  readonly type: PrimitiveType;
  // 名称
  label: string;

  // geo
  width: number;
  height: number;
  // transform matrix
  transform: Matrix;

  // style
  fills: IPaint[];
  strokes: IPaint[];
}

export interface ITranformable {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
}
export const TRANFORMER_PROPS: (keyof ITranformable)[] = [
  'x',
  'y',
  'scaleX',
  'scaleY',
  'rotation',
  'skewX',
  'skewY',
];

export interface IRect extends IPrimitive {
  type: 'Rect';
}

export interface IEllipse extends IPrimitive {
  type: 'Ellipse';
}

export interface IFrame extends IPrimitive {
  type: 'Frame';
}
export interface ILine extends IPrimitive {
  type: 'Line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface IPicture extends IPrimitive {
  type: 'Picture';
  src: string;
  scaleMode?: 'FILL' | 'FIT' | 'STRETCH';
}
export interface IText extends IPrimitive {
  type: 'Text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
}

function createBase(attr: Partial<IPrimitive>): IPrimitive {
  return {
    uuid: nanoid(),
    type: 'Unknown',
    label: 'Text',
    width: 0,
    height: 0,
    transform: new Matrix().identity(),
    fills: [{ type: 'SOLID', color: '#FFFFFF' }],
    strokes: [],
    ...attr,
  };
}

export function createRect(attr: Partial<IRect> = {}): IRect {
  return {
    ...createBase(attr),
    type: 'Rect',
  } as IRect;
}

export function createEllipse(attr: Partial<IEllipse> = {}): IEllipse {
  return {
    ...createBase(attr),
    type: 'Ellipse',
  } as IEllipse;
}

export function createFrame(attr: Partial<IFrame> = {}): IFrame {
  return {
    ...createBase(attr),
    type: 'Frame',
  } as IFrame;
}

export function createLine(attr: Partial<ILine> = {}): ILine {
  return {
    ...createBase(attr),
    type: 'Line',
    x1: attr.x1 ?? 0,
    y1: attr.y1 ?? 0,
    x2: attr.x2 ?? 100,
    y2: attr.y2 ?? 100,
  } as ILine;
}

export function createPicture(attr: Partial<IPicture> = {}): IPicture {
  return {
    ...createBase(attr),
    type: 'Picture',
    src: attr.src || '',
    scaleMode: attr.scaleMode || 'FILL',
  } as IPicture;
}

export function createText(attr: Partial<IText> = {}): IText {
  return {
    ...createBase(attr),
    type: 'Text',
    text: attr.text || 'Hello World',
    fontSize: attr.fontSize || 16,
    fontFamily: attr.fontFamily || 'Arial',
    fontWeight: attr.fontWeight || 'Normal',
  } as IText;
}
export function createTransformer(attr: Partial<IPrimitive> = {}): IPrimitive {
  return {
    ...createBase(attr),
    type: 'Transformer',
  };
}
