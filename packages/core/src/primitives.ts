import { Graphics, Container } from 'pixi.js';
import { nanoid } from 'nanoid';

export const PRIMITIVE_MAP = {
  RECTANGLE: 'RECTANGLE',
  ELLIPSE: 'ELLIPSE',
  FRAME: 'FRAME',
} as const;

export type PrimitiveType = (typeof PRIMITIVE_MAP)[keyof typeof PRIMITIVE_MAP];

export interface IBasePrimitive {
  // uuid, 对象的唯一id
  readonly uuid: string;
  // 节点类型
  readonly type: PrimitiveType;
  title: string;
  w: number;
  h: number;

  // 下面几个实际上可以转换成transform matrix
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
  outlineGraphics: Graphics;
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
    this.eventMode = 'static';
    this.interactive = true;
    // outline graphics sits above the main graphics and is used for hover outline
    this.outlineGraphics = new Graphics();
    // ensure outline doesn't block pointer events on children
    this.outlineGraphics.interactive = false;
    this.addChild(this.outlineGraphics);
    // show outline on hover
    this.on('pointerover', () => this.drawOutline(true));
    this.on('pointerout', () => this.drawOutline(false));
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
   * Draw or clear an outline for hover state.
   * Subclasses can override this method to provide custom outline shapes.
   * Default implementation draws a rectangle outline.
   */
  drawOutline(show = true) {
    console.log('defaut drawOutline', show);
    this.outlineGraphics.clear();
    if (!show) return;

    // Default implementation: draw a rectangle outline
    this.outlineGraphics.rect(0, 0, this.w, this.h);
    this.outlineGraphics.stroke('#1890ff');
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

  override drawOutline(show = true): void {
    console.log('ellipse drawOutline', show);
    this.outlineGraphics.clear();
    if (!show) return;

    this.outlineGraphics.ellipse(
      this.w / 2,
      this.h / 2,
      this.w / 2,
      this.h / 2
    );
    this.outlineGraphics.stroke('#1890ff');
  }
}

type IFrameConfig = Partial<IFrame>;

export class Frame extends AbstractPrimitive implements IFrame {
  readonly type = PRIMITIVE_MAP.FRAME;
  constructor(config: IFrameConfig) {
    super();
    Object.assign(this, config);
    this.fills = 'white';
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
