import { FederatedPointerEvent } from 'pixi.js';
import type { ITool, IPoint } from './types';
import { AbstractPrimitive } from '../primitives';
import { Editor } from '../editor';

abstract class AbstractDrawShapeTool implements ITool {
  abstract readonly id: string;
  abstract readonly desc: string;

  pressing = false;
  last: IPoint | null = null;
  delta: IPoint | null = null;
  drawingShape: AbstractPrimitive | null = null;
  editor: Editor;
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
    this.pressing = true;
    this.last = { x: e.global.x, y: e.global.y };
    this.drawingShape = this.createShape();
    this.drawingShape.updateAttr({
      x: this.last.x,
      y: this.last.y,
      w: 0,
      h: 0,
    });
  }

  onPointerMove(e: FederatedPointerEvent) {
    if (!this.pressing || !this.last || !this.drawingShape) return;
    const dx = e.global.x - this.last.x;
    const dy = e.global.y - this.last.y;
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
