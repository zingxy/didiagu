import { GraphicsContext } from 'pixi.js';

import { IEllipse, PrimitiveMap } from './primitive';
import { AbstractPrimitiveView } from './abstract-primitive';

export class Ellipse extends AbstractPrimitiveView<IEllipse> {
  readonly type = PrimitiveMap.Ellipse as 'Ellipse';
  constructor(model: IEllipse) {
    super(model);
    this.draw();
  }

  override buildPath(ctx: GraphicsContext): void {
    const { x, y, width, height } = this.model;
    this.x = x;
    this.y = y;
    ctx.ellipse(width / 2, height / 2, width / 2, height / 2);
  }
}
