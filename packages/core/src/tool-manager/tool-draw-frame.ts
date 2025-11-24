import { Frame } from '../primitives';
import { AbstractDrawShapeTool } from './tool-draw-shape';
import { registerActions } from '../action-manager';
registerActions({
  name: 'tool-draw-frame',
  label: 'Draw Frame',
  perform: (/* manager */ { editor }) => {
    // Implementation for activating the draw rectangle tool
    editor.setCurrentTool('FRAME');
  },
  keyTest: (e: KeyboardEvent) => {
    return e.key.toLowerCase() === 'f';
  },
});

export class DrawFrameTool extends AbstractDrawShapeTool {
  readonly id = 'FRAME';
  readonly desc = 'Draw Frame';

  override createShape() {
    return new Frame({});
  }

  override finalizeShape(): void {
    // Implementation for finalizing the rectangle shape
  }
}
