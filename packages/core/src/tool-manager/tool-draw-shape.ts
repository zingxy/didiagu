import { FederatedPointerEvent } from 'pixi.js';
import type { ITool, IPoint } from './types';
import { AbstractPrimitive } from '../primitives';
import { Editor } from '../editor';
const DRAG_THRESHOLD = 2; // 像素阈值，小于此值视为点击

abstract class AbstractDrawShapeTool implements ITool {
  abstract readonly id: string;
  abstract readonly desc: string;

  private dragging = false;
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
  onActivate() {
    console.log(`${this.desc} tool activated`);
  }

  onDeactivate() {
    console.log(`${this.desc} tool deactivated`);
  }

  onPointerDown(e: FederatedPointerEvent) {
    if (e.button !== 0) return; // only left button
    this.last = { x: e.global.x, y: e.global.y };
    this.drawingShape = this.createShape();
    this.counter++;
    this.editor.sceneGraph.addChild('default', this.drawingShape);
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
    if (!this.last || !this.drawingShape) return;
    const stage = this.editor.sceneGraph;
    const currentLocal = stage.toLocal({ x: e.global.x, y: e.global.y });
    const lastLocal = stage.toLocal({ x: this.last.x, y: this.last.y });
    // 计算距离起始点的总距离
    const globalDx = e.global.x - this.last.x;
    const globalDy = e.global.y - this.last.y;
    const distance = Math.sqrt(globalDx * globalDx + globalDy * globalDy);

    // 超过阈值才视为拖拽
    if (distance >= DRAG_THRESHOLD) {
      this.dragging = true;
    }

    const dx = currentLocal.x - lastLocal.x;
    const dy = currentLocal.y - lastLocal.y;

    this.delta = { x: dx, y: dy };
    this.last = { x: e.global.x, y: e.global.y };
    this.drawingShape.updateAttr({
      w: this.drawingShape.w + dx,
      h: this.drawingShape.h + dy,
    });
  }

  onPointerUp() {
    if (!this.drawingShape) {
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

    this.dragging = false;
    this.last = null;
    this.delta = null;
    this.drawingShape = null;
  }

  /** 创建图形 */
  abstract createShape(): AbstractPrimitive;
  /** 完成图形 */
  abstract finalizeShape(): void;
}

export { AbstractDrawShapeTool };
