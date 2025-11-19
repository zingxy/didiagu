import { Graphics } from 'pixi.js';
import { AbstractPrimitive, IFrame, PRIMITIVE_MAP } from './abstract-primitive';

type IFrameConfig = Partial<IFrame>;

export class Frame extends AbstractPrimitive implements IFrame {
  readonly type = PRIMITIVE_MAP.FRAME;
  maskGraphics: Graphics;
  constructor(config: IFrameConfig) {
    super();
    Object.assign(this, config);
    this.fills = 'white';
    this.maskGraphics = new Graphics();
    this.mask = this.maskGraphics;
    this.addChild(this.maskGraphics);
    this.render();
  }
  override isLeaf(): boolean {
    return false;
  }
  override render(): void {
    this.graphics.clear();
    this.graphics.rect(0, 0, this.w, this.h);
    this.maskGraphics.clear();
    this.maskGraphics.rect(0, 0, this.w, this.h);
    this.maskGraphics.fill('white');

    if (this.strokes) {
      this.graphics.stroke(this.strokes);
    }
    if (this.fills) {
      this.graphics.fill(this.fills);
    }
  }
}
