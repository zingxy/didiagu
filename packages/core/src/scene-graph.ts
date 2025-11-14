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
import { AbstractPrimitive } from './primitives';

export interface SceneGraphEvents {
  /** 场景树节点增加或删除 */
  'scene.descendantChanged': () => void;
}

export class SceneGraph {
  private bus: Editor['bus'];
  /**
   * 记录的是app.stage
   * 实际上不会对app.stage进行任何变换，因此它和pixi的world是一致。
   */
  private world: PIXI.Container;
  /** 场景内容容器，会应用 camera 变换，业务应用的根容器 */
  public stage: PIXI.Container<AbstractPrimitive>;

  constructor(editor: Editor, world: PIXI.Container) {
    this.bus = editor.bus;
    this.world = world;
    // 创建独立的场景容器，用于应用 camera 变换
    this.stage = new PIXI.Container();
    this.world.addChild(this.stage);
    this.bindEvents();
  }
  bindEvents() {
    this.bus.on('camera.changed', this.onCameraChanged.bind(this));
  }
  onCameraChanged(matrix: Matrix) {
    // 应用变换到场景容器
    this.stage.setFromMatrix(matrix);
  }

  addChild: PIXI.Container['addChild'] = (...children) => {
    this.bus.emit('scene.descendantChanged');
    console.log(children);
    return this.stage.addChild(...children);
  };
  removeChild: PIXI.Container['removeChild'] = (...children) => {
    return this.stage.removeChild(...children);
  };
  removeChildren: PIXI.Container['removeChildren'] = (...args) => {
    return this.stage.removeChildren(...args);
  };
}
