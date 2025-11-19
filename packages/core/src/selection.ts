/**
 * @file selection.ts
 * @description 选区管理
 * @author HongQing Zeng
 * @date 2025-11-17
 * @version 1.0.0
 */
import { Graphics } from 'pixi.js';
import { Editor } from './editor';
import { AbstractPrimitive } from './primitives';

export interface SelectionManagerEvents {
  /** 选区变化 */
  'selection.changed': (selected: AbstractPrimitive[]) => void;
}
export const OUTLINE_COLOR = '#1890ff';

export class SelectionManager {
  private editor: Editor;
  private bus: Editor['bus'];
  public selected: Set<AbstractPrimitive>;
  public deselected: Set<AbstractPrimitive>;
  private sceneGraph: Editor['sceneGraph'];
  private outlineGraphics = new Graphics();

  constructor(editor: Editor) {
    this.editor = editor;
    this.bus = editor.bus;
    this.sceneGraph = editor.sceneGraph;
    this.selected = new Set<AbstractPrimitive>();
    this.deselected = new Set<AbstractPrimitive>();
  }
  select(primitives: AbstractPrimitive[]) {
    for (const primitive of primitives) {
      this.selected.add(primitive);
    }
    this.effect();
  }

  deselect(primitives: AbstractPrimitive[]) {
    for (const primitive of primitives) {
      this.selected.delete(primitive);
      this.deselected.add(primitive);
    }
    this.effect();
  }
  delectAll() {
    for (const primitive of this.selected) {
      this.selected.delete(primitive);
      this.deselected.add(primitive);
    }
    this.selected.clear();
  }

  isSelected(primitive: AbstractPrimitive): boolean {
    return this.selected.has(primitive);
  }

  effect() {
    this.outlineGraphics.clear();
    if (this.selected.size === 0) {
      this.outlineGraphics.visible = false;
      return;
    }

    this.bus.emit('selection.changed', Array.from(this.selected));
    for (const primitive of this.selected) {
      this.outlineGraphics.resetTransform();
      this.outlineGraphics.transform(
        this.editor.camera.transform
          .clone()
          .invert()
          .append(primitive.worldTransform)
      );
      primitive.drawOutline(this.outlineGraphics);
    }
    this.sceneGraph.addChild('helper', this.outlineGraphics);
  }
}
