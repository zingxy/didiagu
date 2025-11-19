import { Graphics, Container } from 'pixi.js';
import { nanoid } from 'nanoid';

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
    this.render();
  }

  /**
   * 绘制高亮轮廓，比如悬浮或选中时使用。
   * Subclasses can override this method to provide custom outline shapes.
   * Default implementation draws a rectangle outline.
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
}

type IRectConfig = Partial<IRect>;

export class Rect extends AbstractPrimitive implements IRect {
  readonly type = PRIMITIVE_MAP.RECTANGLE;
  r: number = 0;
  constructor(config: IRectConfig) {
    super();
    Object.assign(this, config);
    this.eventMode = 'static';
    this.interactive = true;
    this.render();
  }

  render(): void {
    this.graphics.clear();
    this.graphics.rect(0, 0, this.w, this.h);
    if (this.strokes) {
      this.graphics.stroke(this.strokes);
    }
    if (this.fills) {
      this.graphics.fill(this.fills);
    }
  }
}

type IEllipseConfig = Partial<IEllipse>;

export class Ellipse extends AbstractPrimitive implements IEllipse {
  readonly type = PRIMITIVE_MAP.ELLIPSE;
  constructor(config: IEllipseConfig) {
    super();
    Object.assign(this, config);
    this.render();
  }

  override render(): void {
    this.graphics.clear();
    this.graphics.ellipse(this.w / 2, this.h / 2, this.w / 2, this.h / 2);

    if (this.strokes) {
      this.graphics.stroke(this.strokes);
    }
    if (this.fills) {
      this.graphics.fill(this.fills);
    }
  }

  override drawOutline(graphics: Graphics): void {
    graphics.beginPath();
    graphics.ellipse(this.w / 2, this.h / 2, this.w / 2, this.h / 2);
    graphics.stroke(OUTLINE_COLOR);
  }
}

type IFrameConfig = Partial<IFrame>;

export class Frame extends AbstractPrimitive implements IFrame {
  readonly type = PRIMITIVE_MAP.FRAME;
  maskGraphics: Graphics;
  constructor(config: IFrameConfig) {
    super();
    Object.assign(this, config);
    this.fills = 'white';
    this.maskGraphics = new Graphics();
    this.mask = this.maskGraphics;
    this.addChild(this.maskGraphics);
    this.render();
  }
  override isLeaf(): boolean {
    return false;
  }
  override render(): void {
    this.graphics.clear();
    this.graphics.rect(0, 0, this.w, this.h);
    this.maskGraphics.clear();
    this.maskGraphics.rect(0, 0, this.w, this.h);
    this.maskGraphics.fill('white');

    if (this.strokes) {
      this.graphics.stroke(this.strokes);
    }
    if (this.fills) {
      this.graphics.fill(this.fills);
    }
  }
}

export interface LayerConfig {
  /** 图层 ID */
  id: string;
  /** 图层名称 */
  name: string;
  /** 是否可见 */
  visible?: boolean;
  /** 是否锁定（不可编辑） */
  locked?: boolean;
  /** z-index，用于排序 */
  zIndex?: number;
  /** 是否可记录历史 */
  trackable?: boolean;
}
/**
 * 图层类,逻辑层，不作为渲染节点
 */
export class Layer extends AbstractPrimitive {
  public id: string;
  public name: string;
  public locked: boolean = false;
  public trackable: boolean = true;
  readonly type = PRIMITIVE_MAP.LAYER;
  constructor(config: LayerConfig) {
    super();
    this.id = config.id;
    this.name = config.name;
    this.visible = config.visible ?? true;
    this.locked = config.locked ?? false;
    this.zIndex = config.zIndex ?? 0;
    this.sortableChildren = true;
    this.trackable = config.trackable ?? true;
  }
  override render(): void {
    // 图层不需要渲染
  }
  override isLeaf(): boolean {
    return false;
  }
}
