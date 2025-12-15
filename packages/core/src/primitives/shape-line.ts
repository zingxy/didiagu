import { GraphicsContext } from 'pixi.js';
import { AbstractPrimitive, ILine, PrmitiveMap } from './abstract-primitive';
import { defaultHandleConfigs } from './shape-transformer';

type ILineConfig = Partial<ILine>;

export class Line extends AbstractPrimitive implements ILine {
  readonly type = PrmitiveMap.Line;
  r: number = 0;
  constructor(config: ILineConfig) {
    super();
    Object.assign(this, config);
    this.draw();
    this.controlPoints = [
      {
        handleType: 'endpoint',
        getPosition: (transformer) => {
          return transformer.toLocal({ x: 0, y: 0 }, this);
        },
      },
      {
        handleType: 'endpoint',
        getPosition: (transformer) => {
          return transformer.toLocal({ x: this.w, y: this.h }, this);
        },
      },
      defaultHandleConfigs.find((h) => h.handleType === 'mover')!,
    ];
  }
  public buildPath(ctx: GraphicsContext): void {
    ctx.moveTo(0, 0).lineTo(this.w, this.h);
  }
}
