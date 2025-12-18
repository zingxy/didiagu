import { Graphics, GraphicsContext } from 'pixi.js';
import {
  AbstractPrimitive,
  IEllipse,
  PrimitiveMap,
} from './abstract-primitive';

type IEllipseConfig = Partial<IEllipse>;

export class Ellipse extends AbstractPrimitive implements IEllipse {
  readonly type = PrimitiveMap.Ellipse;
  constructor(config: IEllipseConfig) {
    super();
    Object.assign(this, config);
    this.draw();
  }

  override buildPath(ctx: GraphicsContext): void {
    ctx.ellipse(this.w / 2, this.h / 2, this.w / 2, this.h / 2);
  }

  override drawOutline(graphics: Graphics): void {
    graphics.beginPath();
    graphics.ellipse(this.w / 2, this.h / 2, this.w / 2, this.h / 2);
  }
}
