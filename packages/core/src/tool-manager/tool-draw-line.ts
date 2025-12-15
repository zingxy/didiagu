import { Line } from '../primitives';
import { AbstractDrawShapeTool } from './tool-draw-shape';
import { registerAction } from '../action-manager';
import { IPoint } from './types';

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

  override updateShape(start: IPoint, end: IPoint, w: number, h: number): void {
    if (!this.drawingShape) return;
    const startInLocal = this.drawingShape.toLocal(
      { x: start.x, y: start.y },
      this.editor.sceneGraph.scene
    );
    const endInLocal = this.drawingShape.toLocal(
      { x: end.x, y: end.y },
      this.editor.sceneGraph.scene
    );
    console.log('update line shape', startInLocal, endInLocal);
    (this.drawingShape as Line).updateAttrs({
      x: start.x,
      y: start.y,
      x1: startInLocal.x,
      y1: startInLocal.y,
      x2: endInLocal.x,
      y2: endInLocal.y,
      w: w,
      h: h,
    });
  }
  override finalizeShape(): void {
    // Implementation for finalizing the rectangle shape
  }
}
