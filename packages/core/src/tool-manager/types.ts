import type { FederatedPointerEvent } from 'pixi.js';

export interface ITool {
  id: string;
  desc: string;

  // 生命周期
  onActivate?: () => void;
  onDeactivate?: () => void;

  // 基础事件
  onPointerDown?: (e: FederatedPointerEvent) => void;
  onPointerMove?: (e: FederatedPointerEvent) => void;
  onPointerUp?: (e: FederatedPointerEvent) => void;
}

interface DidiaguEvent {
  _originalEvent: unknown;
}

export interface DidiaguPointerEvent extends DidiaguEvent {
  worldX: number;
  worldY: number;
}

export const createDidiaguPointerEventFromPixi = (
  e: FederatedPointerEvent
): DidiaguPointerEvent => {
  return {
    _originalEvent: e,
    worldX: e.global.x,
    worldY: e.global.y,
  };
};

export interface IPoint {
  x: number;
  y: number;
}
