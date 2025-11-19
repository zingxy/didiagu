// store.ts
import type { AbstractPrimitive, Editor } from '@didiagu/core';
import { create } from 'zustand';

// Define types for state & actions
interface AppState {
  editor: Editor | null;
  currentToolId: string | null;
  selection: AbstractPrimitive[];
  setEditor: (editor: Editor | null) => void;
  setCurrentToolId: (toolId: string | null) => void;
  setSelection: (selection: AbstractPrimitive[]) => void;
}

// Create store using the curried form of `create`
export const useAppState = create<AppState>()((set, get) => ({
  editor: null,
  currentToolId: null,
  selection: [],
  setEditor: (editor) => {
    // 清理旧的 editor 事件监听
    const oldEditor = get().editor;
    if (oldEditor) {
      oldEditor.off('tool.changed', handleToolChanged);
      oldEditor.off('selection.changed', handleSelectionChanged);
    }

    // 设置新的 editor
    set(() => ({ editor }));

    // 订阅新 editor 的事件
    if (editor) {
      // 同步工具状态
      editor.on('tool.changed', handleToolChanged);
      // 初始化当前工具
      const currentToolId = editor.getCurrentToolId();
      if (currentToolId) {
        set({ currentToolId });
      }

      // 同步选区状态
      editor.on('selection.changed', handleSelectionChanged);
      // 初始化当前选区
      const selection = Array.from(editor.selectionManager.selected);
      set({ selection });
    }
  },
  setCurrentToolId: (toolId) => {
    const { editor } = get();
    if (editor && toolId) {
      // 通知 editor 切换工具
      editor.setCurrentTool(toolId);
    }
    // 状态会通过 'tool.changed' 事件自动更新
  },
  setSelection: (selection) => {
    const { editor } = get();
    if (editor) {
      // 更新 editor 的选区
      editor.selectionManager.deselectAll();
      if (selection.length > 0) {
        editor.selectionManager.select(selection);
      }
    }
    // 状态会通过 'selection.changed' 事件自动更新
  },
}));

// 事件处理函数 (需要在外部定义以便移除监听)
function handleToolChanged(toolId: string) {
  useAppState.setState({ currentToolId: toolId });
}

function handleSelectionChanged(selection: AbstractPrimitive[]) {
  useAppState.setState({ selection });
}
