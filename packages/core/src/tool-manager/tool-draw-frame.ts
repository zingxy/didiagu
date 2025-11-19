import { Frame } from '../primitives';
import { AbstractDrawShapeTool } from './tool-draw-shape';

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
