import { Editor } from '.';
import * as PIXI from 'pixi.js';

const GRID_SIZE = 100;

export class Grid {
  private editor: Editor;
  private g: PIXI.Graphics = new PIXI.Graphics();
  constructor(editor: Editor) {
    this.editor = editor;
    this.editor.on('camera.changed', this.onCameraChanged);
    this.editor.sceneGraph.bottom.addChild(this.g);
    this.draw();
  }
  onCameraChanged = () => {
    // Handle camera changes related to the grid
    this.draw(this.editor.camera.getZoom());
  };
  draw(zoom: number = 1) {
    const topleft = this.editor.sceneGraph.scene.toLocal(
      new PIXI.Point(0, 0),
      this.editor.sceneGraph.cameraSpace
    );
    const bottomRight = this.editor.sceneGraph.scene.toLocal(
      new PIXI.Point(
        this.editor.app.renderer.width,
        this.editor.app.renderer.height
      ),
      this.editor.sceneGraph.cameraSpace
    );

    const startX = Math.floor(topleft.x / GRID_SIZE) * GRID_SIZE - GRID_SIZE;
    const endX = Math.ceil(bottomRight.x / GRID_SIZE) * GRID_SIZE + GRID_SIZE;
    const startY = Math.floor(topleft.y / GRID_SIZE) * GRID_SIZE - GRID_SIZE;
    const endY = Math.ceil(bottomRight.y / GRID_SIZE) * GRID_SIZE + GRID_SIZE;
    const stepX = (endX - startX) / GRID_SIZE;
    const stepY = (endY - startY) / GRID_SIZE;
    console.log('stepX, stepY', stepX, stepY, startX, endX, startY, endY);
    const topleftInCam = this.editor.sceneGraph.cameraSpace.toLocal(
      new PIXI.Point(startX, startY),
      this.editor.sceneGraph.scene
    );

    const bottomRightInCam = this.editor.sceneGraph.cameraSpace.toLocal(
      new PIXI.Point(endX, endY),
      this.editor.sceneGraph.scene
    );

    const gridSize = GRID_SIZE * zoom;

    this.g.clear();
    // for (let x = topleftInCam.x; x <= bottomRightInCam.x; x += gridSize) {
    //   this.g.moveTo(x, topleftInCam.y);
    //   this.g.lineTo(x, bottomRightInCam.y);
    // }

    // for (let y = topleftInCam.y; y <= bottomRightInCam.y; y += gridSize) {
    //   this.g.moveTo(topleftInCam.x, y);
    //   this.g.lineTo(bottomRightInCam.x, y);
    // }

    for (let x = topleftInCam.x; x <= bottomRightInCam.x; x += gridSize) {
      for (let y = topleftInCam.y; y <= bottomRightInCam.y; y += gridSize) {
        this.g.circle(x, y, 3);
      }
    }

    this.g.fill({ width: 2, color: '#c4c4c4' });
  }
}
