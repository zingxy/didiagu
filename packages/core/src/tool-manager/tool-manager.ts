/**
 * @file index.ts
 * @description 工具管理
 * @author HongQing Zeng
 * @date 2025-11-13
 * @version 1.0.0
 */

import { FederatedPointerEvent } from 'pixi.js';
import { Editor } from '../editor';
import type { ITool } from './types';
import { DrawRectTool } from './tool-draw-rect';
import { DrawEllipseTool } from './tool-draw-ellipse ';
import { DrawFrameTool } from './tool-draw-frame';
import { SelectTool } from './tool-select';
import { EventBus } from '../event-bus';
import { DidiaguPointerEvent, IEventHandler } from '../dispatcher';
export interface ToolManagerEvents {
  'tool.changed': (toolId: string) => void;
}

// 工具管理器
export class ToolManager implements IEventHandler {
  private tools = new Map<string, ITool>();
  private currentTool: ITool | null = null;
  private bus: EventBus;
  constructor(editor: Editor) {
    this.bus = editor.bus;
    this.register(new DrawRectTool(editor));
    this.register(new DrawEllipseTool(editor));
    this.register(new DrawFrameTool(editor));
    this.register(new SelectTool(editor));
    this.setCurrentTool('SELECT');
  }

  register(tool: ITool) {
    this.tools.set(tool.id, tool);
  }

  setCurrentTool(id: string) {
    const nextTool = this.tools.get(id);
    if (!nextTool) return;
    if (this.currentTool?.id === nextTool.id) return;
    this.currentTool?.onDeactivate?.();
    this.currentTool = nextTool;
    this.currentTool.onActivate?.();
    this.bus.emit('tool.changed', this.currentTool.id);
  }

  getCurrentToolId() {
    return this.currentTool?.id;
  }

  onPointerDown(e: FederatedPointerEvent): boolean {
    this.currentTool?.onPointerDown?.(e);
    return true; // 工具处理了事件
  }

  onPointerMove(e: FederatedPointerEvent): boolean {
    this.currentTool?.onPointerMove?.(e);
    return true; // 工具处理了事件
  }

  onPointerUp(e: FederatedPointerEvent): boolean {
    this.currentTool?.onPointerUp?.(e);
    return true; // 工具处理了事件
  }
  onClick(e: DidiaguPointerEvent): boolean | void {
    this.currentTool?.onClick?.(e);
    return true; // 工具处理了事件
  }
}

type Tools = [DrawRectTool, DrawEllipseTool, DrawFrameTool, SelectTool];
export type ToolType = Tools[number]['id'];
