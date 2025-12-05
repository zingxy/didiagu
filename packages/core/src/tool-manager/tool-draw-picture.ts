import { AbstractDrawShapeTool } from './tool-draw-shape';
import { Picture } from '../primitives/shape-picture';

export class DrawPictureTool extends AbstractDrawShapeTool {
  readonly id = 'PICTURE';
  readonly desc = 'Draw Picture';
  src: string = '';

  onActivate(...args: unknown[]): void {
    const [src] = args as string[];
    this.src = src;
  }
  override createShape() {
    return new Picture({
      fills: [{ type: 'SOLID', color: 'grey' }],
      src: this.src,
    });
  }

  override finalizeShape(): void {
    // Implementation for finalizing the rectangle shape
  }
}
