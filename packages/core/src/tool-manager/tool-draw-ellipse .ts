import { Ellipse } from '../primitives';
import { AbstractDrawShapeTool } from './tool-draw-shape';
import { registerAction } from '../action-manager';
registerAction({
  name: 'tool-draw-ellipse',
  label: 'Draw Ellipse',
  perform: (/* manager */ { editor }) => {
    // Implementation for activating the draw rectangle tool
    editor.setCurrentTool('ELLIPSE');
  },
  keyTest: (e: KeyboardEvent) => {
    return e.key.toLowerCase() === 'o';
  },
});

export class DrawEllipseTool extends AbstractDrawShapeTool {
  readonly id = 'ELLIPSE';
  readonly desc = 'Draw Ellipse';

  override createShape() {
    return new Ellipse({});
  }

  override finalizeShape(): void {
    // Implementation for finalizing the rectangle shape
  }
}
