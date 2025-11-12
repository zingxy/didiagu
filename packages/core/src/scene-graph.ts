/**
 * @file scene-graph.ts
 * @description 场景树封装
 * @author HongQing Zeng
 * @date 2025-11-12
 * @version 1.0.0
 */

import { Matrix } from '@didiagu/math';
import { Editor } from './editor';
import * as PIXI from 'pixi.js';

export class SceneGraph {
  private bus: Editor['bus'];
  stage: PIXI.Container;
  constructor(editor: Editor) {
    this.bus = editor.bus;
    this.stage = editor.app.stage;

    this.bindEvents();
  }
  bindEvents() {
    this.bus.on('camera.changed', this.onCameraChanged.bind(this));
  }
  onCameraChanged(matrix: Matrix) {
    console.log('SceneGraph onCameraChanged:', matrix);
    this.stage.localTransform = matrix;
  }

  addChild: PIXI.Container['addChild'] = (...children) => {
    return this.stage.addChild(...children);
  };
  removeChild: PIXI.Container['removeChild'] = (...children) => {
    return this.stage.removeChild(...children);
  };
  removeChildren: PIXI.Container['removeChildren'] = (...args) => {
    return this.stage.removeChildren(...args);
  };
}
