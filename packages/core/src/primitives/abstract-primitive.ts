import { Graphics, Container } from 'pixi.js';
import { nanoid } from 'nanoid';
import { BASE_INSPECTOR_FIELDS, InspectorSection } from './inspector';

export const PRIMITIVE_MAP = {
  RECTANGLE: 'RECTANGLE',
  ELLIPSE: 'ELLIPSE',
  FRAME: 'FRAME',
  LAYER: 'LAYER',
} as const;

export const OUTLINE_COLOR = '#1890ff';

export type PrimitiveType = (typeof PRIMITIVE_MAP)[keyof typeof PRIMITIVE_MAP];

export interface IBasePrimitive {
  // uuid, 对象的唯一id
  readonly uuid: string;
  // 节点类型
  readonly type: PrimitiveType;
  title: string;
  w: number;
  h: number;

  // T
  x: number;
  y: number;
  // R
  rotation: number;
  // K
  skewX: number;
  skewY: number;
  // S
  scaleX: number;
  scaleY: number;
  // fill
  fills: string;
  // stroke
  strokes: string;
}

export interface IRect extends IBasePrimitive {
  type: 'RECTANGLE';
  r: number;
}

export interface IEllipse extends IBasePrimitive {
  type: 'ELLIPSE';
}

export interface IFrame extends IBasePrimitive {
  type: 'FRAME';
}

export type IPrimitive = IEllipse | IRect | IFrame;

export abstract class AbstractPrimitive
  extends Container
  implements IBasePrimitive
{
  abstract readonly type: PrimitiveType;
  uuid: string;
  graphics: Graphics;
  axis: Graphics;
  w = 0;
  h = 0;
  fills = 'grey';
  strokes = '';
  title = '';
  constructor() {
    super();
    this.uuid = nanoid();
    this.graphics = new Graphics();
    this.addChild(this.graphics);
    this.eventMode = 'auto';
    this.interactive = true;
    this.axis = new Graphics();
    this.addChild(this.axis);
    this.axis
      .moveTo(0, 0)
      .lineTo(10, 0)
      .stroke('#ff0000')
      .moveTo(0, 0)
      .lineTo(0, 10)
      .stroke('#00ff00');
  }
  abstract render(): void;

  get scaleX() {
    return this.scale.x;
  }
  set scaleX(value: number) {
    this.scale.x = value;
  }

  get scaleY() {
    return this.scale.y;
  }
  set scaleY(value: number) {
    this.scale.y = value;
  }

  get skewX() {
    return this.skew.x;
  }
  set skewX(value: number) {
    this.skew.x = value;
  }

  get skewY() {
    return this.skew.y;
  }
  set skewY(value: number) {
    this.skew.y = value;
  }

  updateAttr(attr: Partial<Omit<IBasePrimitive, 'uuid' | 'type'>>) {
    Object.assign(this, attr);
    this.emit('attr.changed', attr);
    this.render();
  }

  /**
   * 绘制高亮轮廓。
   */
  drawOutline(graphics: Graphics): void {
    graphics.beginPath().rect(0, 0, this.w, this.h).stroke(OUTLINE_COLOR);
  }
  /**
   * 是否是叶子节点
   */
  isLeaf(): boolean {
    return true;
  }

  /**
   * 获取属性面板字段schema
   */
  getInspectorFields(): InspectorSection[] {
    return BASE_INSPECTOR_FIELDS;
  }
  /**
   * @description 获取参数
   * @param key
   * @returns
   */
  getParameter(key: Exclude<keyof IBasePrimitive, 'uuid' | 'type'>): unknown {
    return this[key];
  }
  setParameter<K extends Exclude<keyof IBasePrimitive, 'uuid' | 'type'>>(
    key: K,
    value: IBasePrimitive[K]
  ): void {
    (this as IBasePrimitive)[key] = value;
    this.render();
  }
}
