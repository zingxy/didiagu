import { Ellipse } from '../primitives';
import { AbstractDrawShapeTool } from './tool-draw-shape';

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
