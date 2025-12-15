import { GraphicsContext } from 'pixi.js';
import { AbstractPrimitive, ILine, PrmitiveMap } from './abstract-primitive';

type ILineConfig = Partial<ILine>;

export class Line extends AbstractPrimitive implements ILine {
  readonly type = PrmitiveMap.Line;
  r: number = 0;
  constructor(config: ILineConfig) {
    super();
    Object.assign(this, config);
    this.draw();
  }
  public buildPath(ctx: GraphicsContext): void {
    ctx.moveTo(0, 0).lineTo(this.w, this.h);
  }
}
