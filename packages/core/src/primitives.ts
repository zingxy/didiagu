import { Graphics, Container } from 'pixi.js';
import { nanoid } from 'nanoid';

export interface IPrimitive {
  // uuid, 对象的唯一id, 来自前端
  readonly uuid: string;
  // 节点类型
  readonly type: string;
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
}

export interface IRect extends IPrimitive {
  // corner radius
  r: number;
}

export interface ICircle extends IPrimitive {
  // radius
  r: number;
}

export abstract class AbstractPrimitive
  extends Container
  implements IPrimitive
{
  uuid: string;
  graphics: Graphics;
  abstract type: string;
  w = 0;
  h = 0;
  constructor() {
    super();
    this.uuid = nanoid();
    this.graphics = new Graphics();
    this.addChild(this.graphics);
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

  updateAttr(attr: Partial<Omit<IPrimitive, 'uuid' | 'type'>>) {
    Object.assign(this, attr);
    this.render();
  }
}

type IRectConfig = Partial<IRect>;

export class Rect extends AbstractPrimitive implements IRect {
  type = 'rectangle';
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
    this.graphics.rect(0, 0, this.w, this.h).fill(0xffffff);
  }
}
