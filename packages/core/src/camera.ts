/**
 * @file camera.ts
 * @description 实现 Camera 类，用于管理视图的平移和缩放功能。
 * @author HongQing Zeng
 * @date 2025-11-11
 * @version 1.0.0
 */
import * as PIXI from 'pixi.js';
import { Editor } from './editor';
import { Matrix } from '@didiagu/math';
import { EventBus } from './event-bus';

interface Point {
  x: number;
  y: number;
}

export interface CameraEvents {
  /** 触发相机缩放变化时的事件 */
  'camera.zoomChanged': (zoom: number) => void;
  /** 触发相机位置变化时的事件 */
  'camera.positionChanged': () => void;
  'camera.changed': (matrix: Matrix) => void;
}
export class Camera {
  /** 编辑器舞台容器 */
  private stage: PIXI.Container;
  private eventBus: EventBus;
  /** 相机的变换矩阵: p_world = transform * p_camera */
  transform: Matrix = new Matrix();
  isPressing: boolean = false;
  last?: Point | null = null;

  constructor(editor: Editor) {
    this.stage = editor.app.stage;
    this.eventBus = editor.bus;
    this.bindEvents();
  }

  bindEvents() {
    this.stage.on('pointerdown', this.down, this);
    this.stage.on('pointermove', this.move, this);
    this.stage.on('pointerup', this.up, this);
    this.stage.on('wheel', this.wheel, this);
    this.stage.on("pointerupoutside", this.up, this);
  }

  down = (e: PIXI.FederatedPointerEvent) => {
    this.isPressing = true;
    this.last = { x: e.global.x, y: e.global.y };
    console.log('Camera pointer down:', e);
  };
  move = (e: PIXI.FederatedPointerEvent) => {
    if (!this.isPressing || !this.last) return;

    const dx = e.global.x - this.last.x;
    const dy = e.global.y - this.last.y;

    // const delta = new Matrix().translate(dx, dy);

    this.transform.translate(dx, dy);
    this.eventBus.emit('camera.changed', this.transform.clone());
    this.last = { x: e.global.x, y: e.global.y };
  };
  up = (e: PIXI.FederatedEvent) => {
    this.isPressing = false;
    this.last = null;
    console.log('Camera pointer up:', e);
  };
  wheel = (e: PIXI.FederatedWheelEvent) => {
    this.isPressing = false;
    this.last = null;
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const mouseX = e.global.x;
    const mouseY = e.global.y;

    const t = new Matrix().translate(-mouseX, -mouseY);
    const t_invert = new Matrix().translate(mouseX, mouseY);
    const s = new Matrix().scale(zoomFactor, zoomFactor);
    this.transform = t_invert.append(s).append(t).append(this.transform);
    this.eventBus.emit('camera.changed', this.transform.clone());
  };
}
