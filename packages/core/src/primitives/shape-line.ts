import { GraphicsContext } from 'pixi.js';

import { ILine, PrimitiveMap } from './primitive';
import { AbstractPrimitiveView } from './abstract-primitive';
// import { normalizeRect } from '@didiagu/math';

type ILineConfig = Partial<ILine>;

export class Line extends AbstractPrimitiveView<ILine> {
  readonly type = PrimitiveMap.Line as 'Line';

  x1: number = 0;
  y1: number = 0;
  x2: number = 0;
  y2: number = 0;
  constructor(model: ILine) {
    super(model);
    this.draw();
  }
  public buildPath(ctx: GraphicsContext): void {
    const { x1, y1, x2, y2 } = this.model;
    this.x = x1;
    this.y = y1;
    ctx.moveTo(0, 0);
    ctx.lineTo(x2 - x1, y2 - y1);
  }
}
