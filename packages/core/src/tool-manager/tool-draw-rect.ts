import { Rect } from '../primitives';
import { AbstractDrawShapeTool } from './tool-draw-shape';

export class DrawRectTool extends AbstractDrawShapeTool {
  readonly id = 'RECTANGLE';
  readonly desc = 'Draw Rectangle';

  override createShape() {
    return new Rect({});
  }

  override finalizeShape(): void {
    // Implementation for finalizing the rectangle shape
  }
}
