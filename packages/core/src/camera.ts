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
import { keyPressed } from './which-key-pressed';
import { IEventHandler } from './dispatcher';

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
export class Camera implements IEventHandler {
  /** 编辑器舞台容器 */
  private stage: PIXI.Container;
  private eventBus: EventBus;
  /** 相机的变换矩阵: p_camera = transform * p_world */
  transform: Matrix = new Matrix();
  isPressing: boolean = false;
  last?: Point | null = null;

  constructor(editor: Editor) {
    this.eventBus = editor.bus;
    this.stage = editor.sceneGraph.stage;
  }

  onPointerDown = (e: PIXI.FederatedPointerEvent): boolean => {
    // 中键拖动或者空格键+左键拖动
    if (e.button === 1 || (e.button === 0 && keyPressed.space)) {
      this.isPressing = true;
      this.last = { x: e.global.x, y: e.global.y };
      return true; // 事件已处理
    }
    return false; // 事件未处理，传递给工具
  };

  /** 处理指针移动事件 - 由 Editor 调用 */
  onPointerMove = (e: PIXI.FederatedPointerEvent): boolean => {
    if (!this.isPressing || !this.last) return false;

    const dx = e.global.x - this.last.x;
    const dy = e.global.y - this.last.y;

    this.transform.translate(dx, dy);
    this.eventBus.emit('camera.changed', this.transform.clone());
    this.last = { x: e.global.x, y: e.global.y };
    return true; // 事件已处理
  };

  /** 处理指针释放事件 - 由 Editor 调用 */
  onPointerUp = (): boolean => {
    if (this.isPressing) {
      this.isPressing = false;
      this.last = null;
      return true; // 事件已处理
    }
    return false; // 事件未处理
  };

  onWheel = (e: PIXI.FederatedWheelEvent) => {
    // 滚轮缩放时重置拖动状态
    this.isPressing = false;
    this.last = null;
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const nextZoom = this.getZoom() * zoomFactor;
    if (nextZoom < 0.5 || nextZoom > 10) {
      return true; // 限制缩放范围
    }
    const mouseX = e.global.x;
    const mouseY = e.global.y;

    const t = new Matrix().translate(-mouseX, -mouseY);
    const t_invert = new Matrix().translate(mouseX, mouseY);
    const s = new Matrix().scale(zoomFactor, zoomFactor);
    this.transform = t_invert.append(s).append(t).append(this.transform);
    this.eventBus.emit('camera.changed', this.transform.clone());
    return true; // 事件已处理
  };
  getZoom(): number {
    // 假设均匀缩放，返回 x 方向的缩放因子
    return this.transform.a;
  }
}
