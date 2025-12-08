import { AbstractPrimitive, IRect, PrmitiveMap } from './abstract-primitive';

type IRectConfig = Partial<IRect>;

export class Rect extends AbstractPrimitive implements IRect {
  readonly type = PrmitiveMap.Rect;
  r: number = 0;
  constructor(config: IRectConfig) {
    super();
    Object.assign(this, config);
    this.render();
  }

  render(): void {
    this.graphics.clear();
    this.graphics.rect(0, 0, this.w, this.h);
    this.applyFillsAndStrokes();
  }
}
