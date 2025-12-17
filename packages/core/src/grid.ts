import { Editor } from '.';
import * as PIXI from 'pixi.js';

const GRID_SIZE = 100;

export class Grid {
  private editor: Editor;
  private g: PIXI.Graphics = new PIXI.Graphics();
  // text pool
  private texts: PIXI.Text[] = [];
  private cursor: number = 0;
  constructor(editor: Editor) {
    this.editor = editor;
    this.editor.on('camera.changed', this.onCameraChanged);
    this.editor.sceneGraph.bottom.addChild(this.g);
    this.draw();
  }

  getText() {
    if (this.cursor < this.texts.length) {
      const t = this.texts[this.cursor];
      this.cursor++;
      return t;
    } else {
      const t = new PIXI.Text('', { fontSize: 12, fill: '#ff0000' });
      this.texts.push(t);
      this.cursor++;
      this.editor.sceneGraph.cameraSpace.addChild(t);
      return t;
    }
  }
  onCameraChanged = () => {
    // Handle camera changes related to the grid
    this.draw(this.editor.camera.getZoom());
  };
  draw(zoom: number = 1) {
    this.cursor = 0;
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
    const topleftInCam = this.editor.sceneGraph.cameraSpace.toLocal(
      new PIXI.Point(startX, startY),
      this.editor.sceneGraph.scene
    );

    const bottomRightInCam = this.editor.sceneGraph.cameraSpace.toLocal(
      new PIXI.Point(endX, endY),
      this.editor.sceneGraph.scene
    );

    const gridSizeInCam = GRID_SIZE * zoom;
    const sceneOriginInCam = this.editor.sceneGraph.cameraSpace.toLocal(
      new PIXI.Point(0, 0),
      this.editor.sceneGraph.scene
    );

    const MAJOR_TICK_LENGTH = 10;
    const MAJOR_BAR_LENGTH = 32;
    const MINOR_TICK_COUNT = 5;
    const MINOR_TICK_LENGTH = 5;
    const TICK_COLOR = 'red ';

    this.g.clear();
    // FIXME: 用screen.width 怎么少了一段长度
    this.g
      .moveTo(0, MAJOR_BAR_LENGTH)
      .lineTo(bottomRightInCam.x, MAJOR_BAR_LENGTH);
    this.g
      .moveTo(MAJOR_BAR_LENGTH, 0)
      .lineTo(MAJOR_BAR_LENGTH, bottomRightInCam.y);
    const offset = MAJOR_BAR_LENGTH - MAJOR_TICK_LENGTH;
    for (let x = topleftInCam.x; x <= bottomRightInCam.x; x += gridSizeInCam) {
      this.g.moveTo(x, offset);
      this.g.lineTo(x, MAJOR_BAR_LENGTH);

      const text = this.getText();
      text.text = `${Math.round(
        this.editor.sceneGraph.scene.toLocal(
          new PIXI.Point(x, 0),
          this.editor.sceneGraph.cameraSpace
        ).x
      )}`;
      text.x = x;
      text.y = offset - 5;
      text.anchor = 0.5;
      text.rotation = 0;
    }

    for (let y = topleftInCam.y; y <= bottomRightInCam.y; y += gridSizeInCam) {
      this.g.moveTo(offset, y);
      this.g.lineTo(MAJOR_BAR_LENGTH, y);
      const text = this.getText();
      text.text = `${Math.round(
        this.editor.sceneGraph.scene.toLocal(
          new PIXI.Point(0, y),
          this.editor.sceneGraph.cameraSpace
        ).y
      )}`;
      text.x = offset - 5;
      text.y = y;
      text.anchor = 0.5;
      text.rotation = 0;
    }

    if (gridSizeInCam >= 200) {
      const minorTickStep = gridSizeInCam / MINOR_TICK_COUNT;
      // 竖向 minor tick
      for (
        let x = topleftInCam.x;
        x <= bottomRightInCam.x;
        x += gridSizeInCam
      ) {
        for (let i = 1; i < MINOR_TICK_COUNT; i++) {
          const mx = x + i * minorTickStep;
          if (mx < bottomRightInCam.x) {
            this.g.moveTo(mx, 0);
            this.g.lineTo(mx, MINOR_TICK_LENGTH);
          }
        }
      }
      // 横向 minor tick
      for (
        let y = topleftInCam.y;
        y <= bottomRightInCam.y;
        y += gridSizeInCam
      ) {
        for (let i = 1; i < MINOR_TICK_COUNT; i++) {
          const my = y + i * minorTickStep;
          if (my < bottomRightInCam.y) {
            this.g.moveTo(0, my);
            this.g.lineTo(MINOR_TICK_LENGTH, my);
          }
        }
      }
    }

    this.g.stroke({ width: 1, color: TICK_COLOR });

    // 交点圆
    for (let x = topleftInCam.x; x <= bottomRightInCam.x; x += gridSizeInCam) {
      for (
        let y = topleftInCam.y;
        y <= bottomRightInCam.y;
        y += gridSizeInCam
      ) {
        this.g.circle(x, y, 3);
      }
    }
    this.g.circle(sceneOriginInCam.x, sceneOriginInCam.y, 10);
    this.g.stroke({ width: 2, color: '#c4c4c4' });
    this.g.fill({ width: 2, color: '#c4c4c4' });

    for (; this.cursor < this.texts.length; this.cursor++) {
      this.texts[this.cursor].text = '';
    }
  }
}
