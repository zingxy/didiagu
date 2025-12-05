import { AbstractPrimitive, IRect, PRIMITIVE_MAP } from './abstract-primitive';

type IRectConfig = Partial<IRect>;

export class Rect extends AbstractPrimitive implements IRect {
  readonly type = PRIMITIVE_MAP.RECTANGLE;
  r: number = 0;
  constructor(config: IRectConfig) {
    super();
    Object.assign(this, config);
    this.eventMode = 'static';
    this.interactive = true;
    this.render();
  }

  render(): void {
    this.graphics.clear();
    this.graphics.rect(0, 0, this.w, this.h);
    this.applyFillsAndStrokes();
  }
}
