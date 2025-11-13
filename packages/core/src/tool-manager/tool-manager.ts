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

// 工具管理器
export class ToolManager {
  private tools = new Map<string, ITool>();
  private currentTool: ITool | null = null;
  private editor: Editor;
  constructor(editor: Editor) {
    this.editor = editor;
    this.register(new DrawRectTool(editor));
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
