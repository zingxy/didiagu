import { FederatedPointerEvent } from 'pixi.js';
import type { ITool, IPoint } from './types';
import { AbstractPrimitive } from '../primitives';
import { Editor } from '../editor';

abstract class AbstractDrawShapeTool implements ITool {
  abstract readonly id: string;
  abstract readonly desc: string;

  private pressing = false;
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
    this.pressing = true;
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
    if (!this.pressing || !this.last || !this.drawingShape) return;
    const stage = this.editor.sceneGraph;
    const currentLocal = stage.toLocal({ x: e.global.x, y: e.global.y });
    const lastLocal = stage.toLocal({ x: this.last.x, y: this.last.y });

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
    if (!this.pressing) return;
    if (!this.last) return;
    if (!this.delta) return;
    this.finalizeShape();
    this.pressing = false;
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
