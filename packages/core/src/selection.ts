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
import { Transformer } from './primitives/shape-transformer';

export interface SelectionManagerEvents {
  /** 选区变化 */
  'selection.changed': (selected: AbstractPrimitive[]) => void;
}
export const OUTLINE_COLOR = '#1890ff';

export class SelectionManager {
  private editor: Editor;
  private bus: Editor['bus'];
  public selected: Set<AbstractPrimitive>;
  private sceneGraph: Editor['sceneGraph'];
  private outlineGraphics = new Graphics();
  private transformer = new Transformer();
  private dirty = false;

  constructor(editor: Editor) {
    this.editor = editor;
    this.bus = editor.bus;
    this.sceneGraph = editor.sceneGraph;
    this.selected = new Set<AbstractPrimitive>();
    this.sceneGraph.addChild('helper', this.transformer);
  }
  select(primitives: AbstractPrimitive[]) {
    for (const primitive of primitives) {
      if (this.selected.has(primitive)) continue;
      this.selected.add(primitive);
      primitive.on('attr.changed', this.onSelectedPrimitiveAttrChanged);
      this.selectionChange();
    }
  }

  deselect(primitives: AbstractPrimitive[]) {
    for (const primitive of primitives) {
      if (!this.selected.has(primitive)) continue;
      this.selected.delete(primitive);
      primitive.off('attr.changed', this.onSelectedPrimitiveAttrChanged);
      this.selectionChange();
    }
  }
  deselectAll() {
    this.deselect(Array.from(this.selected));
  }

  selectAll() {
    const arr: AbstractPrimitive[] = [];
    this.editor.sceneGraph.traverse(
      this.editor.sceneGraph.getDefaultLayer(),
      (node) => {
        if (node instanceof AbstractPrimitive) {
          arr.push(node);
        }
      }
    );
    this.select(arr);
  }
  selectOnly(primitive: AbstractPrimitive) {
    this.deselectAll();
    this.select([primitive]);
  }

  /**
   *
   * @description 选区变化事件触发, 使用微任务合并多次变化,避免频繁触发selection.changed事件.
   * 如果要实时同步选区变化,直接访问editor.selectionManager.selected.
   */
  selectionChange() {
    this.updateOutline();
    this.updateTransformer();
    if (this.dirty) return;
    this.dirty = true;
    Promise.resolve().then(() => {
      this.bus.emit('selection.changed', Array.from(this.selected));
      this.dirty = false;
    });
  }

  onSelectedPrimitiveAttrChanged = () => {
    this.updateOutline();
    this.updateTransformer();
  };

  updateOutline() {
    this.outlineGraphics.clear();
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
  updateTransformer() {
    console.log('updateTransformer', this.selected.size);
    this.transformer.update(Array.from(this.selected));
  }
}
