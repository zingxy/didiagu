import { Rect } from '../primitives';
import { AbstractDrawShapeTool } from './tool-draw-shape';
import { registerAction } from '../action-manager';

registerAction({
  name: 'tool-draw-rect',
  label: 'Draw Rectangle',
  perform: (/* manager */ { editor }) => {
    // Implementation for activating the draw rectangle tool
    editor.setCurrentTool('RECTANGLE');
  },
  keyTest: (e: KeyboardEvent) => {
    return e.key.toLowerCase() === 'r';
  },
});

export class DrawRectTool extends AbstractDrawShapeTool {
  readonly id = 'RECTANGLE';
  readonly desc = 'Draw Rectangle';

  override createShape() {
    return new Rect({
      strokes: [{ type: 'SOLID', color: '#000000' }],
    });
  }

  override finalizeShape(): void {
    // Implementation for finalizing the rectangle shape
  }
}
