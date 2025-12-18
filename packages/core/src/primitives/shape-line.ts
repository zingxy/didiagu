import { GraphicsContext } from 'pixi.js';
import { AbstractPrimitive, ILine, PrimitiveMap } from './abstract-primitive';
import { defaultHandleConfigs } from './shape-transformer';
// import { normalizeRect } from '@didiagu/math';

type ILineConfig = Partial<ILine>;

export class Line extends AbstractPrimitive<ILine> implements ILine {
  readonly type = PrimitiveMap.Line;

  x1: number = 0;
  y1: number = 0;
  x2: number = 0;
  y2: number = 0;
  constructor(config: ILineConfig) {
    super();
    Object.assign(this, config);
    this.draw();
    this.controlPoints = [
      {
        handleType: 'endpoint',
        getPosition: (transformer) => {
          return transformer.toLocal({ x: this.x1, y: this.y1 }, this);
        },
      },
      {
        handleType: 'endpoint',
        getPosition: (transformer) => {
          return transformer.toLocal({ x: this.x2, y: this.y2 }, this);
        },
      },
      defaultHandleConfigs.find((h) => h.handleType === 'mover')!,
    ];
  }
  public buildPath(ctx: GraphicsContext): void {
    // const rect = normalizeRect(0, 0, this.w, this.h);

    // ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
  }
}
