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
    this.createShape();
  }

  onPointerMove(e: FederatedPointerEvent) {
    if (!this.pressing || !this.last) return;
    const dx = e.global.x - this.last.x;
    const dy = e.global.y - this.last.y;
    this.delta = { x: dx, y: dy };
    this.last = { x: e.global.x, y: e.global.y };
    this.updateShape(this.delta);
  }

  onPointerUp() {
    if (!this.pressing) return;
    if (!this.last) return;
    if (!this.delta) return;
    this.finalizeShape();
    this.pressing = false;
    this.last = null;
    this.delta = null;
  }
  /** 创建图形 */
  abstract createShape(): void;
  /** 更新图形 */
  abstract updateShape(delta: IPoint): void;
  /** 完成图形 */
  abstract finalizeShape(): void;
}

export { AbstractDrawShapeTool };
