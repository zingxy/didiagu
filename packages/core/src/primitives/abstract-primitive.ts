import { Graphics, Container } from 'pixi.js';
import { nanoid } from 'nanoid';
import { BASE_INSPECTOR_SCHEMA, InspectorSchema } from './inspector';
import { IPaint } from './style';

export const PrmitiveMap = {
  Rect: 'Rect',
  Ellipse: 'Ellipse',
  Frame: 'Frame',
  Layer: 'Layer',
  Transformer: 'Transformer',
  Picture: 'Picture',
  Text: 'Text',
} as const;

export const OUTLINE_COLOR = '#1890ff';

export type PrimitiveType = (typeof PrmitiveMap)[keyof typeof PrmitiveMap];

export interface IBasePrimitive {
  // uuid, 对象的唯一id
  readonly uuid: string;
  // 节点类型
  readonly type: PrimitiveType;
  // 名称
  label: string;
  // 初始尺寸
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
  fills: IPaint[];
  // stroke
  strokes: IPaint[];
  strokeWidth: number;
  // 是否可选中
  selectable: boolean;
}

export interface IRect extends IBasePrimitive {
  type: 'Rect';
  r: number;
}

export interface IEllipse extends IBasePrimitive {
  type: 'Ellipse';
}

export interface IFrame extends IBasePrimitive {
  type: 'Frame';
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
  graphics: Graphics;
  axis: Graphics;
  w = 0;
  h = 0;
  fills: IPaint[] = [];
  strokes: IPaint[] = [];
  strokeWidth: number = 1;
  /**
   * 是否可选中
   */
  selectable = true;

  /**
   * Pixi 原生属性，会自动触发脏标记
   */
  private static readonly PIXI_NATIVE_PROPS = new Set([
    'x',
    'y',
    'position',
    'rotation',
    'angle',
    'scaleX',
    'scaleY',
    'scale',
    'skewX',
    'skewY',
    'skew',
    'alpha',
    'visible',
    'pivot',
    'anchor',
  ]);

  /**
   * 需要重新绘制的自定义属性
   */
  private static readonly CUSTOM_GEOMETRY_PROPS = new Set([
    'w',
    'h',
    'fills',
    'strokes',
    'strokeWidth',
    'r', // Rect 的圆角
    'text',
    'fontSize',
    'fontFamily',
    'fontWeight', // Text 属性
    'src',
    'scaleMode', // Picture 属性
  ]);

  private _drawScheduled = false;

  constructor() {
    super();
    this.uuid = nanoid();
    this.graphics = new Graphics();
    this.addChild(this.graphics);
    this.eventMode = 'dynamic';
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
   * 检查属性是否需要重新绘制
   */
  private needsRedraw(attrs: Partial<Omit<T, 'uuid' | 'type'>>): boolean {
    return Object.keys(attrs).some((key) =>
      AbstractPrimitive.CUSTOM_GEOMETRY_PROPS.has(key)
    );
  }

  /**
   * 调度绘制（防止同一帧内重复绘制）
   */
  private scheduleDraw(): void {
    if (this._drawScheduled) return;

    this._drawScheduled = true;
    requestAnimationFrame(() => {
      this.draw();
      this._drawScheduled = false;
    });
  }

  /**
   * 更新属性
   * - Pixi 原生属性：自动触发 Pixi 的脏标记
   * - 自定义几何属性：需要重新绘制 Graphics
   */
  updateAttrs(attrs: Partial<Omit<T, 'uuid' | 'type'>>) {
    Object.assign(this, attrs);
    this.emit('attr.changed', attrs);

    // 只有自定义属性变化时才需要重新绘制
    if (this.needsRedraw(attrs)) {
      this.scheduleDraw();
    }
    // Pixi 原生属性（如 x, y, rotation）会自动处理脏标记，无需手动绘制
  }

  /**
   * @description 绘制图形路径, 不应该被外部调用
   */
  protected abstract draw(): void;

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
  getParameter(key: Exclude<keyof IBasePrimitive, 'uuid' | 'type'>): unknown {
    return this[key];
  }
  setParameter<K extends Exclude<keyof IBasePrimitive, 'uuid' | 'type'>>(
    key: K,
    value: IBasePrimitive[K]
  ): void {
    (this as IBasePrimitive)[key] = value;

    // 检查是否需要重绘
    if (AbstractPrimitive.CUSTOM_GEOMETRY_PROPS.has(key as string)) {
      this.scheduleDraw();
    }
  }
  applyFillsAndStrokes(): void {
    this.fills.forEach((fill) => {
      if (fill.type === 'SOLID') {
        this.graphics.fill(fill.color);
      }
    });
    this.strokes.forEach((stroke) => {
      if (stroke.type === 'SOLID') {
        this.graphics.stroke({ color: stroke.color, width: this.strokeWidth });
      }
    });
  }
}
