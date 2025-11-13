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
import { EventBus } from '../event-bus';
export interface ToolManagerEvents {
  'tool.changed': (toolId: string) => void;
}

// 工具管理器
export class ToolManager {
  private tools = new Map<string, ITool>();
  private currentTool: ITool | null = null;
  private editor: Editor;
  private bus: EventBus;
  constructor(editor: Editor) {
    this.editor = editor;
    this.bus = editor.bus;
    this.register(new DrawRectTool(editor));
    this.setCurrentTool('RECTANGLE');
    this.bindEvents();
  }
  bindEvents() {
    this.editor.app.stage.on('pointerdown', this.handlePointerDown.bind(this));
    this.editor.app.stage.on('pointermove', this.handlePointerMove.bind(this));
    this.editor.app.stage.on('pointerup', this.handlePointerUp.bind(this));
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

  handlePointerDown(e: FederatedPointerEvent) {
    this.currentTool?.onPointerDown?.(e);
  }

  handlePointerMove(e: FederatedPointerEvent) {
    this.currentTool?.onPointerMove?.(e);
  }

  handlePointerUp(e: FederatedPointerEvent) {
    this.currentTool?.onPointerUp?.(e);
  }
}

type Tools = [DrawRectTool];
export type ToolType = Tools[number]['id'];
