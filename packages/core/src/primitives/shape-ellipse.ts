import { Graphics } from 'pixi.js';
import {
  AbstractPrimitive,
  IEllipse,
  PRIMITIVE_MAP,
} from './abstract-primitive';

type IEllipseConfig = Partial<IEllipse>;

export class Ellipse extends AbstractPrimitive implements IEllipse {
  readonly type = PRIMITIVE_MAP.ELLIPSE;
  constructor(config: IEllipseConfig) {
    super();
    Object.assign(this, config);
    this.render();
  }

  override render(): void {
    this.graphics.clear();
    this.graphics.ellipse(this.w / 2, this.h / 2, this.w / 2, this.h / 2);
    this.applyFillsAndStrokes();
  }

  override drawOutline(graphics: Graphics): void {
    graphics.beginPath();
    graphics.ellipse(this.w / 2, this.h / 2, this.w / 2, this.h / 2);
  }
}
