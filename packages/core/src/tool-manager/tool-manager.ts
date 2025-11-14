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
import { EventBus } from '../event-bus';
export interface ToolManagerEvents {
  'tool.changed': (toolId: string) => void;
}

// 工具管理器
export class ToolManager {
  private tools = new Map<string, ITool>();
  private currentTool: ITool | null = null;
  private bus: EventBus;
  constructor(editor: Editor) {
    this.bus = editor.bus;
    this.register(new DrawRectTool(editor));
    this.register(new DrawEllipseTool(editor));
    this.register(new DrawFrameTool(editor));
    this.setCurrentTool('FRAME');
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

  /** 处理指针按下事件 - 由 Editor 调用 */
  handlePointerDown(e: FederatedPointerEvent): boolean {
    this.currentTool?.onPointerDown?.(e);
    return true; // 工具处理了事件
  }

  /** 处理指针移动事件 - 由 Editor 调用 */
  handlePointerMove(e: FederatedPointerEvent): boolean {
    this.currentTool?.onPointerMove?.(e);
    return true; // 工具处理了事件
  }

  /** 处理指针释放事件 - 由 Editor 调用 */
  handlePointerUp(e: FederatedPointerEvent): boolean {
    this.currentTool?.onPointerUp?.(e);
    return true; // 工具处理了事件
  }
}

type Tools = [DrawRectTool, DrawEllipseTool, DrawFrameTool];
export type ToolType = Tools[number]['id'];
