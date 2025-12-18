import {
  Graphics,
  Container,
  GraphicsContext,
  Matrix,
  Transform,
} from 'pixi.js';
import { IPrimitive, ITranformable, PrimitiveType, TRANFORMER_PROPS } from '..';

export const OUTLINE_COLOR = '#1890ff';

export abstract class AbstractPrimitiveView<
  T extends IPrimitive = IPrimitive
> extends Container {
  abstract readonly type: PrimitiveType;
  selectable = true;
  graphics: Graphics;
  model: T;

  /**
   * 需要重新绘制的自定义属性
   */

  constructor(model: T) {
    super();
    this.eventMode = 'dynamic';
    this.interactive = true;
    this.model = model;
    this.graphics = new Graphics();
    this.addChild(this.graphics);
    // this.draw();
  }

  updateAttrs(patch: Partial<T & ITranformable>): void {
    let m: Matrix | undefined = undefined;
    if (TRANFORMER_PROPS.some((prop) => prop in patch)) {
      const {
        x = 0,
        y = 0,
        scaleX = 1,
        scaleY = 1,
        rotation = 0,
        skewX = 0,
        skewY = 0,
      } = patch as Partial<ITranformable>;
      const transform = new Transform();
      transform.position.set(x, y);
      transform.scale.set(scaleX, scaleY);
      transform.rotation = rotation;
      transform.skew.set(skewX, skewY);
      m = transform.matrix;

      // delete these props from patch to avoid overwriting
      TRANFORMER_PROPS.forEach((prop) => {
        delete patch[prop as keyof typeof patch];
      });
    }
    if ('transform' in patch) {
      m = patch.transform as Matrix;
      delete patch.transform;
    }
    const attrs = { ...patch, transform: m } as Partial<T>;
    this.model = { ...this.model, ...attrs };

    if (m) {
      this.setFromMatrix(m);
      // this.updateLocalTransform();
    }
    this.onModelUpdate();
  }

  onModelUpdate() {
    this.draw();
  }
  /**
   * @description 绘制图形路径, 不应该被外部调用
   */
  protected draw() {
    this.graphics.clear();
    this.buildPath(this.graphics.context);
    this.applyFillsAndStrokes();
  }

  public buildPath(ctx: GraphicsContext): void {
    const { width, height, transform } = this.model;
    ctx.rect(0, 0, width, height);
  }

  /**
   * 是否是叶子节点
   */
  isLeaf(): boolean {
    return true;
  }

  applyFillsAndStrokes(): void {
    const { fills = [], strokes = [] } = this.model;
    fills.forEach((fill) => {
      if (fill.type === 'SOLID') {
        this.graphics.fill(fill.color);
      }
    });
    strokes.forEach((stroke) => {
      if (stroke.type === 'SOLID' && stroke.strokeWidth !== undefined) {
        this.graphics.stroke({
          color: stroke.color,
          width: stroke.strokeWidth,
        });
      }
    });
  }
}
