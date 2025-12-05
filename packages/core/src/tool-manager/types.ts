import type { FederatedPointerEvent } from 'pixi.js';
import type { IEventHandler } from '../dispatcher';

export interface ITool extends Partial<IEventHandler> {
  id: string;
  desc: string;

  // 生命周期
  onActivate?: (...args: unknown[]) => void;
  onDeactivate?: () => void;
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
