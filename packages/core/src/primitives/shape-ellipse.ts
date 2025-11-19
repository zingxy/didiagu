import { Graphics } from 'pixi.js';
import {
  AbstractPrimitive,
  IEllipse,
  PRIMITIVE_MAP,
  OUTLINE_COLOR,
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

    if (this.strokes) {
      this.graphics.stroke(this.strokes);
    }
    if (this.fills) {
      this.graphics.fill(this.fills);
    }
  }

  override drawOutline(graphics: Graphics): void {
    graphics.beginPath();
    graphics.ellipse(this.w / 2, this.h / 2, this.w / 2, this.h / 2);
    graphics.stroke(OUTLINE_COLOR);
  }
}
