import { Rect } from '../primitives';
import { AbstractDrawShapeTool } from './tool-draw-shape';
import type { IPoint } from './types';

export class DrawRectTool extends AbstractDrawShapeTool {
  readonly id = 'RECTANGLE';
  readonly desc = 'Draw Rectangle';

  override createShape() {
    this.drawingShape = new Rect({});
    this.editor.sceneGraph.addChild(this.drawingShape);
    return this.drawingShape;
  }

  override updateShape(delta: IPoint): void {
    if (!this.drawingShape) return;
    this.drawingShape.w += delta.x;
    this.drawingShape.h += delta.y;
    this.drawingShape.render();
  }

  override finalizeShape(): void {
    // Implementation for finalizing the rectangle shape
    if (!this.drawingShape) return;
    this.editor.sceneGraph.addChild(this.drawingShape);
  }
}
