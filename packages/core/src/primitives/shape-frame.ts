import { AbstractPrimitive, IFrame, PrmitiveMap } from './abstract-primitive';

type IFrameConfig = Partial<IFrame>;

export class Frame extends AbstractPrimitive implements IFrame {
  readonly type = PrmitiveMap.Frame;
  constructor(config: IFrameConfig) {
    super(true);
    Object.assign(this, config);
    this.draw();
  }
  override isLeaf(): boolean {
    return false;
  }
}
