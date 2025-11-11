import { Graphics, Container } from 'pixi.js';
import { nanoid } from 'nanoid';

interface IPrimitive {
  // uuid, 对象的唯一id, 来自前端
  uuid: string;
  // 节点类型
  type: string;
}

interface IMeta {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  x: number;
  y: number;
}

export abstract class AbstractPrimitive
  extends Container
  implements IPrimitive
{
  uuid: string;
  graphics: Graphics;
  abstract type: string;
  constructor() {
    super();
    this.uuid = nanoid();
    this.graphics = new Graphics();
    this.addChild(this.graphics);
  }
  abstract render(): void;

  _receiveUpdate() {
    this.render();
  }
}

interface IRectMeta extends IMeta {
  x: number;
  y: number;
  w: number;
  h: number;
}
type IRectConfig = Partial<IRectMeta>;

export class Rect extends AbstractPrimitive implements IRectMeta {
  type = 'rectangle';
  w: number;
  h: number;
  constructor(config: IRectConfig) {
    super();
    this.w = config.w || 0;
    this.h = config.h || 0;
    this.w = config.w || 0;
    this.h = config.h || 0;
    this.render();
  }
  render(): void {}
}
