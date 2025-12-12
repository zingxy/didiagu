/**
 * @file highlight.ts
 * @description 悬浮高亮
 * @author HongQing Zeng
 * @date 2025-12-12
 * @version 1.0.0
 */

import { decompose } from '@didiagu/math';
import { AbstractPrimitive, Editor } from '.';
import { DidiaguPointerEvent, IEventHandler } from './dispatcher';
import * as PIXI from 'pixi.js';
export class HoverManager implements IEventHandler {
  editor: Editor;
  g: PIXI.Graphics;
  currentPrimitiveId: string | null = null;
  currentPrimitive: AbstractPrimitive | null = null;
  constructor(editor: Editor) {
    this.editor = editor;
    this.g = new PIXI.Graphics();
    this.editor.sceneGraph.cameraSpace.addChild(this.g);
    this.editor.on('camera.changed', this.stroke.bind(this));
    requestAnimationFrame(this.stroke.bind(this));
  }

  onPointerMove(e: DidiaguPointerEvent): boolean | void {
    // console.log('move', e.target);
    if (e.target instanceof AbstractPrimitive) {
      const primitive = e.target as AbstractPrimitive;
      console.log('hover highlighter', primitive);
      if (!primitive) {
        return;
      }
      if (this.currentPrimitiveId === primitive.uuid) {
        return;
      }
      this.currentPrimitiveId = primitive.uuid;
      this.currentPrimitive = primitive;

      this.stroke();
    } else {
      this.currentPrimitiveId = null;
      this.currentPrimitive = null;
      this.g.clear();
    }
  }
  stroke() {
    if (!this.currentPrimitiveId || !this.currentPrimitive) {
      return;
    }
    const primitive = this.currentPrimitive!;

    this.g.clear();
    this.g.context.transform(primitive.worldTransform);
    // BUG: 这里不应该用setFromMatrix，否则会出现线条不均匀的问题
    // this.g.setFromMatrix(primitive.worldTransform)
    primitive.buildPath(this.g.context);
    this.g.stroke({
      color: 0xff0000,
      width: 3,
    });
    requestAnimationFrame(this.stroke.bind(this));
  }
}
