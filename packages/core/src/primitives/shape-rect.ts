import { AbstractPrimitiveView } from './abstract-primitive';
import { IRect, PrimitiveMap } from './primitive';

export class Rect extends AbstractPrimitiveView<IRect> {
  readonly type = PrimitiveMap.Rect as 'Rect';
  constructor(model: IRect) {
    super(model);
    this.draw();
  }
}
