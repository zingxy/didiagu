/**
 * @file dispatcher.ts
 * @description 统一转发各种画布级、window级、pixijs stage事件
 * @author HongQing Zeng
 * @date 2025-11-17
 * @version 1.0.0
 */

import * as PIXI from 'pixi.js';

export type DidiaguPointerEvent = PIXI.FederatedPointerEvent;
export type DidiaguWheelEvent = PIXI.FederatedWheelEvent;

/**
 * 统一的事件处理器接口
 */
export interface IEventHandler {
  /**
   * 处理指针按下事件
   * @param e 指针事件
   * @returns true 表示事件已处理，false 表示传递给下一个处理器
   */
  onPointerDown?(e: DidiaguPointerEvent): boolean | void;

  /**
   * 处理指针移动事件
   * @param e 指针事件
   * @returns true 表示事件已处理，false 表示传递给下一个处理器
   */
  onPointerMove?(e: DidiaguPointerEvent): boolean | void;

  /**
   * 处理指针释放事件
   * @param e 指针事件
   * @returns true 表示事件已处理，false 表示传递给下一个处理器
   */
  onPointerUp?(e: DidiaguPointerEvent): boolean | void;

  onClick?(e: DidiaguPointerEvent): boolean | void;

  /**
   * 处理双击事件
   * @param e 指针事件
   * @returns true 表示事件已处理，false 表示传递给下一个处理器
   */
  onDblClick?(e: DidiaguPointerEvent): boolean | void;

  /**
   * 处理滚轮事件
   * @param e 滚轮事件
   * @returns true 表示事件已处理，false 表示传递给下一个处理器
   */
  onWheel?(e: DidiaguWheelEvent): boolean | void;

  /**
   * 处理键盘按下事件
   * @param e 键盘事件
   * @returns true 表示事件已处理，false 表示传递给下一个处理器
   */
  onKeyDown?(e: KeyboardEvent): boolean | void;

  /**
   * 处理键盘释放事件
   * @param e 键盘事件
   * @returns true 表示事件已处理，false 表示传递给下一个处理器
   */
  onKeyUp?(e: KeyboardEvent): boolean | void;

  /**
   * 处理右键菜单事件
   * @param e
   */
  onContextMenu?(e: MouseEvent): boolean | void;
}

/**
 * 事件分发器
 */
export class Dispatcher {
  private handlers: IEventHandler[] = [];
  private world: PIXI.Container;
  private canvas: HTMLCanvasElement;

  // 双击检测相关
  private lastClickTime: number = 0;
  private lastClickPos: { x: number; y: number } = { x: 0, y: 0 };
  private readonly DOUBLE_CLICK_THRESHOLD = 300; // 毫秒
  private readonly DOUBLE_CLICK_DISTANCE = 5; // 像素

  constructor(canvas: HTMLCanvasElement, world: PIXI.Container) {
    this.canvas = canvas;
    this.world = world;
    this.bindEvents();
  }

  /**
   * 添加事件处理器
   * @param handler 事件处理器
   */
  addHandler(...handler: IEventHandler[]): void {
    this.handlers.push(...handler);
  }

  /**
   * 移除事件处理器
   * @param handler 要移除的处理器
   */
  private removeHandler(handler: IEventHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index >= 0) {
      this.handlers.splice(index, 1);
    }
  }

  private bindEvents(): void {
    this.world.on('pointerdown', (e: DidiaguPointerEvent) =>
      this.dispatchPointerDown(e)
    );
    this.world.on('pointermove', (e: DidiaguPointerEvent) =>
      this.dispatchPointerMove(e)
    );
    this.world.on('pointerup', (e: DidiaguPointerEvent) =>
      this.dispatchPointerUp(e)
    );
    this.world.on('click', (e: DidiaguPointerEvent) => this.dispatchClick(e));
    this.world.on('wheel', (e: DidiaguWheelEvent) => this.dispatchWheel(e));

    window.addEventListener('keydown', (e: KeyboardEvent) =>
      this.dispatchKeyDown(e)
    );
    window.addEventListener('keyup', (e: KeyboardEvent) =>
      this.dispatchKeyUp(e)
    );

    this.canvas.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
    });
  }

  /**
   * 分发指针按下事件
   */
  dispatchPointerDown(e: DidiaguPointerEvent): boolean {
    for (const handler of this.handlers) {
      if (handler.onPointerDown?.(e)) {
        return true; // 事件被处理，停止传播
      }
    }
    return false; // 没有处理器处理此事件
  }

  /**
   * 分发指针移动事件
   */
  dispatchPointerMove(e: DidiaguPointerEvent): boolean {
    for (const handler of this.handlers) {
      if (handler.onPointerMove?.(e)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 分发指针释放事件
   */
  dispatchPointerUp(e: DidiaguPointerEvent): boolean {
    for (const handler of this.handlers) {
      if (handler.onPointerUp?.(e)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 分发滚轮事件
   */
  dispatchWheel(e: DidiaguWheelEvent): boolean {
    for (const handler of this.handlers) {
      if (handler.onWheel?.(e)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 分发键盘按下事件
   */
  dispatchKeyDown(e: KeyboardEvent): boolean {
    for (const handler of this.handlers) {
      if (handler.onKeyDown?.(e)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 分发键盘释放事件
   */
  dispatchKeyUp(e: KeyboardEvent): boolean {
    for (const handler of this.handlers) {
      if (handler.onKeyUp?.(e)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 分发点击事件，并检测是否为双击
   */
  dispatchClick(e: DidiaguPointerEvent): boolean {
    const currentTime = Date.now();
    const currentPos = { x: e.global.x, y: e.global.y };

    // 检测是否为双击
    const timeDiff = currentTime - this.lastClickTime;
    const distance = Math.sqrt(
      Math.pow(currentPos.x - this.lastClickPos.x, 2) +
        Math.pow(currentPos.y - this.lastClickPos.y, 2)
    );

    const isDblClick =
      timeDiff < this.DOUBLE_CLICK_THRESHOLD &&
      distance < this.DOUBLE_CLICK_DISTANCE;

    if (isDblClick) {
      // 分发双击事件
      this.dispatchDblClick(e);
      // 重置状态，避免触发三击
      this.lastClickTime = 0;
      this.lastClickPos = { x: 0, y: 0 };
      return true;
    } else {
      // 更新最后点击信息
      this.lastClickTime = currentTime;
      this.lastClickPos = currentPos;

      // 分发普通点击事件
      for (const handler of this.handlers) {
        if (handler.onClick?.(e)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 分发双击事件
   */
  dispatchDblClick(e: DidiaguPointerEvent): boolean {
    for (const handler of this.handlers) {
      if (handler.onDblClick?.(e)) {
        return true;
      }
    }
    return false;
  }
}
