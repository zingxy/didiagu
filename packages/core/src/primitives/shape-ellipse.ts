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
    const { width, height } = this.model;
    ctx.ellipse(width / 2, height / 2, width / 2, height / 2);
  }
}
