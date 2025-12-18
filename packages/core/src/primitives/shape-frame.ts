import { AbstractPrimitiveView } from './abstract-primitive';
import { IFrame, PrimitiveMap } from './primitive';

export class Frame extends AbstractPrimitiveView<IFrame> {
  readonly type = PrimitiveMap.Frame as 'Frame';
  constructor(model: IFrame) {
    super(model);
    Object.assign(this, model);
    this.draw();
  }
  override isLeaf(): boolean {
    return false;
  }
}
