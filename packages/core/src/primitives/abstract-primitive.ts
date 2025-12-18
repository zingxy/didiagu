import { Graphics, Container, GraphicsContext } from 'pixi.js';
import { BASE_INSPECTOR_SCHEMA, InspectorSchema } from './inspector';
import { IPrimitive, PrimitiveType } from '..';

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

  updateAttrs(patch: Partial<T>) {
    Object.assign(this.model, patch);
    this.onModelUpdate(patch);
  }

  onModelUpdate(patch: Partial<T>) {
    if (patch.transform) {
      console.log('更新图元变换矩阵:', patch.transform);
      this.setFromMatrix(patch.transform);
      this.updateLocalTransform()
    }
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
    const { x, y, width, height } = this.model;
    this.x = x;
    this.y = y;
    ctx.rect(0, 0, width, height);
  }

  /**
   * 是否是叶子节点
   */
  isLeaf(): boolean {
    return true;
  }

  /**
   * 获取属性面板字段schema
   */
  getInspectorSchema(): InspectorSchema {
    return BASE_INSPECTOR_SCHEMA;
  }
  /**
   * @description 获取参数
   * @param key
   * @returns
   */
  getParameter(key: keyof Partial<T>): unknown {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any)[key];
  }
  setParameter(key: keyof Partial<T>, value: unknown): void {
    this.updateAttrs({ [key]: value } as unknown as Partial<T>);
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
