import { Graphics, Container, GraphicsContext } from 'pixi.js';
import { nanoid } from 'nanoid';
import { BASE_INSPECTOR_SCHEMA, InspectorSchema } from './inspector';
import { IPaint } from './style';
import * as PIXI from 'pixi.js';

export const PrmitiveMap = {
  Rect: 'Rect',
  Ellipse: 'Ellipse',
  Frame: 'Frame',
  Layer: 'Layer',
  Transformer: 'Transformer',
  Picture: 'Picture',
  Text: 'Text',
  Line: 'Line',
} as const;

export const OUTLINE_COLOR = '#1890ff';

export type PrimitiveType = (typeof PrmitiveMap)[keyof typeof PrmitiveMap];

export interface ISize {
  w: number;
  h: number;
}
export interface ITransform {
  x: number;
  y: number;
  rotation: number;
  skewX: number;
  skewY: number;
  scaleX: number;
  scaleY: number;
}

export interface IStyle {
  fills: IPaint[];
  strokes: IPaint[];
}

export const SIZE_PROPS = ['w', 'h'];

export const TRANSFORM_PROPS = [
  'x',
  'y',
  'rotation',
  'skewX',
  'skewY',
  'scaleX',
  'scaleY',
];

export const STYLE_PROPS = ['fills', 'strokes'];

export interface IBasePrimitive extends ISize, ITransform, IStyle {
  // uuid, 对象的唯一id
  readonly uuid: string;
  // 节点类型
  readonly type: PrimitiveType;
  // 名称
  label: string;
  // 是否可选中
  selectable: boolean;
}

export interface IRect extends IBasePrimitive {
  type: 'Rect';
}

export interface IEllipse extends IBasePrimitive {
  type: 'Ellipse';
}

export interface IFrame extends IBasePrimitive {
  type: 'Frame';
}
export interface ILine extends IBasePrimitive {
  type: 'Line';
}

export interface IPicture extends IBasePrimitive {
  type: 'Picture';
  src: string;
  scaleMode?: 'FILL' | 'FIT' | 'STRETCH';
}
export interface IText extends IBasePrimitive {
  type: 'Text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
}

export type IPrimitive = IEllipse | IRect | IFrame | IPicture;

export abstract class AbstractPrimitive<
    T extends IBasePrimitive = IBasePrimitive
  >
  extends Container
  implements IBasePrimitive
{
  abstract readonly type: PrimitiveType;
  uuid: string;
  w = 0;
  h = 0;
  fills: IPaint[] = [];
  strokes: IPaint[] = [];
  selectable = true;

  graphics: Graphics;
  clipGraphics?: Graphics;
  clip: boolean = false;

  /**
   * 需要重新绘制的自定义属性
   */

  private _drawScheduled = false;

  constructor(clip: boolean = false) {
    super();
    this.uuid = nanoid();
    this.eventMode = 'dynamic';
    this.interactive = true;
    this.clip = clip;

    this.graphics = new Graphics();
    if (this.clip) {
      this.clipGraphics = new Graphics(this.graphics.context);
      this.addChild(this.clipGraphics);
      this.mask = this.clipGraphics;
    }

    this.addChild(this.graphics);
  }

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

  /**
   * @description 当这些属性变化时需要重新绘制
   * @returns
   */
  protected getVisualAttrNames() {
    return [...SIZE_PROPS, ...STYLE_PROPS];
  }

  /**
   * 更新属性
   */
  updateAttrs(attrs: Partial<T>) {
    const changed: string[] = [];
    let hasSizeChange = false;
    let hasStyleChange = false;
    let visualChange = false;
    for (const key in attrs) {
      if (this[key as keyof this] !== attrs[key]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any)[key] = attrs[key];
        changed.push(key);

        if (SIZE_PROPS.includes(key)) {
          hasSizeChange = true;
        }
        if (STYLE_PROPS.includes(key)) {
          hasStyleChange = true;
        }
        if (this.getVisualAttrNames().includes(key)) {
          visualChange = true;
        }
      }
    }

    if (changed.length > 0) {
      this.emit('attr.changed', attrs);
    }
    if (hasSizeChange) {
      this.emit('size.changed', { attrs });
    }
    if (hasStyleChange) {
      this.emit('style.changed', { attrs });
    }
    if (visualChange) {
      this.draw();
    }
  }

  /**
   * @description 绘制图形路径, 不应该被外部调用
   */
  protected draw() {
    this.graphics.clear();
    this.buildPath(this.graphics.context);
    this.applyFillsAndStrokes();
  }

  public buildPath(ctx: GraphicsContext): void {
    ctx.rect(0, 0, this.w, this.h);
  }

  /**
   * 绘制高亮轮廓。
   */
  drawOutline(graphics: Graphics): void {
    graphics.beginPath().rect(0, 0, this.w, this.h);
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
  getInspectorSchema(): InspectorSchema {
    return BASE_INSPECTOR_SCHEMA;
  }
  /**
   * @description 获取参数
   * @param key
   * @returns
   */
  getParameter(key: keyof Partial<T>): unknown {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any)[key];
  }
  setParameter(key: keyof Partial<T>, value: unknown): void {
    this.updateAttrs({ [key]: value } as unknown as Partial<T>);
  }
  applyFillsAndStrokes(): void {
    this.fills.forEach((fill) => {
      if (fill.type === 'SOLID') {
        this.graphics.fill(fill.color);
      }
    });
    this.strokes.forEach((stroke) => {
      if (stroke.type === 'SOLID' && stroke.strokeWidth !== undefined) {
        this.graphics.stroke({
          color: stroke.color,
          width: stroke.strokeWidth,
        });
      }
    });
  }
  containsPoint(point: PIXI.Point): boolean {
    return this.graphics.bounds.containsPoint(point.x, point.y);
  }
}
