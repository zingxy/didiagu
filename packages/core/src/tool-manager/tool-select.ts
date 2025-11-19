import { DidiaguPointerEvent } from '../dispatcher';
import { Editor } from '../editor';
import { AbstractPrimitive } from '../primitives';
import type { ITool } from './types';

export class SelectTool implements ITool {
  readonly id = 'SELECT';
  readonly desc = 'Select Tool';
  private editor: Editor;
  constructor(editor: Editor) {
    this.editor = editor;
  }

  onActivate() {
    console.log(`${this.desc} tool activated`);
  }

  onDeactivate() {
    console.log(`${this.desc} tool deactivated`);
  }
  onClick(e: DidiaguPointerEvent) {
    if (!(e.target instanceof AbstractPrimitive)) {
      console.log(
        'select tool clicked on non-primitive target, deselecting all'
      );
      return;
    }
    const primitive = e.target as AbstractPrimitive;
    const selectionManager = this.editor.selectionManager;
    const multiSelect = e.shiftKey;
    if (!multiSelect) {
      selectionManager.deselectAll();
    } else {
      if (selectionManager.isSelected(primitive)) {
        selectionManager.deselect([primitive]);
        return;
      }
    }
    selectionManager.select([primitive]);
  }
}
