import { Line } from '../primitives';
import { AbstractDrawShapeTool } from './tool-draw-shape';
import { registerAction } from '../action-manager';

registerAction({
  name: 'tool-draw-line',
  label: 'Draw Line',
  perform: (/* manager */ { editor }) => {
    // Implementation for activating the draw line tool
    editor.setCurrentTool('LINE');
  },
  keyTest: (e: KeyboardEvent) => {
    return e.key.toLowerCase() === 'l';
  },
});

export class DrawLineTool extends AbstractDrawShapeTool {
  readonly id = 'LINE';
  readonly desc = 'Draw Line';

  override createShape() {
    return new Line({
      strokes: [{ type: 'SOLID', color: '#000000', strokeWidth: 1 }],
    });
  }

  override finalizeShape(): void {
    // Implementation for finalizing the rectangle shape
  }
}
