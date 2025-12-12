import { DidiaguPointerEvent } from '../dispatcher';
import { Editor } from '../editor';
import type { ITool } from './types';
import { registerAction } from '../action-manager';
import { Text } from '../primitives/shape-text';

registerAction({
  name: 'tool-text',
  label: 'Text tool',
  perform: (/* manager */ { editor }) => {
    // Implementation for activating the select tool
    editor.setCurrentTool('Text');
  },
  keyTest: (e: KeyboardEvent) => {
    return e.key.toLowerCase() === 't';
  },
});

export class TextTool implements ITool {
  readonly id = 'Text';
  readonly desc = 'Text Tool';
  private editor: Editor;
  constructor(editor: Editor) {
    this.editor = editor;
  }

  onActivate() {}

  onDeactivate() {}

  /**框选逻辑 */
  onPointerDown(e: DidiaguPointerEvent): boolean | void {
    const stagePose = this.editor.sceneGraph.toLocal(e.global);
    const text = new Text({ x: stagePose.x, y: stagePose.y });
    // FIXME
    this.editor.sceneGraph.doc.addChild(text);
    this.editor.selectionManager.selectOnly(text);
    this.editor.textEditor.activate(text);
    this.editor.setCurrentTool('SELECT');
    return true;
  }
  onPointerMove(e: DidiaguPointerEvent): boolean | void {
    return true;
  }
  onPointerUp(): boolean | void {
    return true;
  }
}
