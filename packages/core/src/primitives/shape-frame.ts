import { Graphics } from 'pixi.js';
import { AbstractPrimitive, IFrame, PrmitiveMap } from './abstract-primitive';

type IFrameConfig = Partial<IFrame>;

export class Frame extends AbstractPrimitive implements IFrame {
  readonly type = PrmitiveMap.Frame;
  maskGraphics: Graphics;
  constructor(config: IFrameConfig) {
    super();
    Object.assign(this, config);
    this.maskGraphics = new Graphics();
    this.mask = this.maskGraphics;
    this.addChild(this.maskGraphics);
    this.draw();
  }
  override isLeaf(): boolean {
    return false;
  }
  override draw(): void {
    this.graphics.clear();
    this.graphics.rect(0, 0, this.w, this.h);
    this.applyFillsAndStrokes();

    this.maskGraphics.clear();
    this.maskGraphics.rect(0, 0, this.w, this.h);
    this.maskGraphics.fill('#ffffff');
  }
}
