/**
 * @file selection.ts
 * @description 选区管理, 负责选区的增删改查及选区变化事件的触发.
 * 注意如果选区里面元素的属性发生变化，不会触发选区变化事件.
 * @author HongQing Zeng
 * @date 2025-11-17
 * @version 1.0.0
 */
import { Editor } from './editor';
import { AbstractPrimitiveView } from './primitives';

export interface SelectionManagerEvents {
  /** 选区变化:仅在选区内元素被添加或移除时触发 */
  'selection.changed': (selected: AbstractPrimitiveView[]) => void;
}
export const OUTLINE_COLOR = '#1890ff';

export class SelectionManager {
  private editor: Editor;
  private bus: Editor['bus'];
  public selected: Set<AbstractPrimitiveView>;
  private sceneGraph: Editor['sceneGraph'];

  constructor(editor: Editor) {
    this.editor = editor;
    this.bus = editor.bus;
    this.sceneGraph = editor.sceneGraph;
    this.selected = new Set<AbstractPrimitiveView>();
  }
  select(primitives: AbstractPrimitiveView[]) {
    for (const primitive of primitives) {
      if (this.selected.has(primitive)) continue;
      this.selected.add(primitive);
      this.selectionChange();
    }
  }

  deselect(primitives: AbstractPrimitiveView[]) {
    for (const primitive of primitives) {
      if (!this.selected.has(primitive)) continue;
      this.selected.delete(primitive);
      this.selectionChange();
    }
  }
  deselectAll() {
    this.deselect(Array.from(this.selected));
  }

  selectAll() {}
  selectOnly(primitive: AbstractPrimitiveView) {
    this.deselectAll();
    this.select([primitive]);
  }

  selectionChange() {
    this.bus.emit('selection.changed', Array.from(this.selected));
  }
}
