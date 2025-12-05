import { FederatedPointerEvent } from 'pixi.js';
import type { ITool, IPoint } from './types';
import { AbstractPrimitive } from '../primitives';
import { Editor } from '../editor';
import { DRAG_THRESHOLD } from '../contants';

abstract class AbstractDrawShapeTool implements ITool {
  abstract readonly id: string;
  abstract readonly desc: string;

  private dragging = false;
  private startPoint: IPoint | null = null; // 记录起始点
  private last: IPoint | null = null;
  private delta: IPoint | null = null;
  // 当前正在绘制的矩形
  private drawingShape: AbstractPrimitive | null = null;
  private editor: Editor;
  // 图形计数器
  private counter: number = 0;
  constructor(editor: Editor) {
    this.editor = editor;
  }

  onPointerDown(e: FederatedPointerEvent) {
    if (e.button !== 0) return; // only left button
    this.startPoint = { x: e.global.x, y: e.global.y }; // 记录起始点
    this.last = { x: e.global.x, y: e.global.y };
    this.drawingShape = this.createShape();
    this.counter++;
    this.editor.sceneGraph.addChild('default', this.drawingShape);
    this.editor.selectionManager.selectOnly(this.drawingShape);
    const stage = this.editor.sceneGraph;
    const localPos = stage.toLocal({ x: this.last.x, y: this.last.y });
    this.drawingShape.updateAttr({
      x: localPos.x,
      y: localPos.y,
      w: 0,
      h: 0,
    });
  }

  onPointerMove(e: FederatedPointerEvent) {
    if (!this.startPoint || !this.drawingShape) return;
    const stage = this.editor.sceneGraph;

    // 计算从起始点到当前点的距离
    const globalDx = e.global.x - this.startPoint.x;
    const globalDy = e.global.y - this.startPoint.y;
    const distance = Math.sqrt(globalDx * globalDx + globalDy * globalDy);

    // 超过阈值才视为拖拽
    if (distance >= DRAG_THRESHOLD) {
      this.dragging = true;
    }

    // 转换为本地坐标
    const startLocal = stage.toLocal({
      x: this.startPoint.x,
      y: this.startPoint.y,
    });
    const currentLocal = stage.toLocal({ x: e.global.x, y: e.global.y });

    let w = currentLocal.x - startLocal.x;
    let h = currentLocal.y - startLocal.y;

    // 获取宽高比约束
    const aspectRatio = this.getAspectRatio();
    const shouldKeepAspect = e.shiftKey || aspectRatio !== null;

    if (shouldKeepAspect) {
      if (aspectRatio !== null) {
        // 图片等有固定宽高比的情况：根据移动方向主导维度
        if (Math.abs(w) > Math.abs(h)) {
          // 宽度主导
          h = Math.sign(h) * (Math.abs(w) / aspectRatio);
        } else {
          // 高度主导
          w = Math.sign(w) * (Math.abs(h) * aspectRatio);
        }
      } else {
        // 按住 Shift 键时保持等比例（正方形/圆形）
        const maxDelta = Math.max(Math.abs(w), Math.abs(h));
        w = Math.sign(w) * maxDelta;
        h = Math.sign(h) * maxDelta;
      }
    }

    this.drawingShape.updateAttr({
      x: w >= 0 ? startLocal.x : startLocal.x + w,
      y: h >= 0 ? startLocal.y : startLocal.y + h,
      w: Math.abs(w),
      h: Math.abs(h),
    });

    this.last = { x: e.global.x, y: e.global.y };
  }

  onPointerUp() {
    if (!this.drawingShape) {
      this.startPoint = null;
      this.last = null;
      this.delta = null;
      this.dragging = false;
      this.drawingShape = null;
      return;
    }

    // 如果用户只是点击（没有拖拽），设置默认宽高为 100 * 100
    if (!this.dragging) {
      this.drawingShape.updateAttr({
        w: 100,
        h: 100,
      });
    }

    this.finalizeShape();
    this.editor.setCurrentTool('SELECT');

    this.dragging = false;
    this.startPoint = null;
    this.last = null;
    this.delta = null;
    this.drawingShape = null;
  }

  /** 创建图形 */
  abstract createShape(): AbstractPrimitive;
  /** 完成图形 */
  abstract finalizeShape(): void;
  /** 获取宽高比约束，返回 null 表示不约束，返回数字表示 width/height 的比例 */
  protected getAspectRatio(): number | null {
    return null;
  }
}

export { AbstractDrawShapeTool };
