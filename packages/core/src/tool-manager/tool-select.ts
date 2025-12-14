import { DidiaguPointerEvent } from '../dispatcher';
import { Editor } from '../editor';
import { Rect } from '../primitives';
import type { ITool } from './types';
import { registerAction } from '../action-manager';

registerAction({
  name: 'tool-select',
  label: 'Select Tool',
  perform: (/* manager */ { editor }) => {
    // Implementation for activating the select tool
    editor.setCurrentTool('SELECT');
  },
  keyTest: (e: KeyboardEvent) => {
    return e.key.toLowerCase() === 'v';
  },
});

export class SelectTool implements ITool {
  readonly id = 'SELECT';
  readonly desc = 'Select Tool';
  private editor: Editor;
  private selectBox: Rect;
  private pressed: boolean = false;
  constructor(editor: Editor) {
    this.editor = editor;
    this.selectBox = new Rect({
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      strokes: [{ type: 'SOLID', color: '#3399FF' }],
      fills: [{ type: 'SOLID', color: 'rgba(51,153,255,0.2)' }],
    });

    this.editor.sceneGraph.helperLayer.addChild(this.selectBox);
  }

  onActivate() {}

  onDeactivate() {}

  /**框选逻辑 */
  onPointerDown(e: DidiaguPointerEvent): boolean | void {
    const stagePos = this.editor.sceneGraph.toLocal(e.global);
    this.selectBox.updateAttrs({
      x: stagePos.x,
      y: stagePos.y,
      w: 0,
      h: 0,
    });
    this.pressed = true;
    return true;
  }
  onPointerMove(e: DidiaguPointerEvent): boolean | void {
    if (!this.pressed) {
      return;
    }
    const startX = this.selectBox.x;
    const startY = this.selectBox.y;
    const currentPos = this.editor.sceneGraph.toLocal(e.global);
    const currentX = currentPos.x;
    const currentY = currentPos.y;
    const rectX = Math.min(startX, currentX);
    const rectY = Math.min(startY, currentY);
    const rectW = Math.abs(currentX - startX);
    const rectH = Math.abs(currentY - startY);
    this.selectBox.updateAttrs({
      x: rectX,
      y: rectY,
      w: rectW,
      h: rectH,
    });

    const primitives = this.editor.sceneGraph.getPrimiveByBounds(
      this.editor.sceneGraph.getSceneBounds(this.selectBox)
    );
    this.editor.selectionManager.deselectAll();
    this.editor.selectionManager.select(primitives);

    return true;
  }
  onPointerUp(): boolean | void {
    if (!this.pressed) {
      return;
    }
    const primitives = this.editor.sceneGraph.getPrimiveByBounds(
      this.editor.sceneGraph.getSceneBounds(this.selectBox)
    );
    this.editor.selectionManager.deselectAll();
    this.editor.selectionManager.select(primitives);
    this.pressed = false;
    this.selectBox.updateAttrs({ w: 0, h: 0 });
  }
}
