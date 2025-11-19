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
export const useAppState = create<AppState>()((set) => ({
  editor: null,
  currentToolId: null,
  selection: [],
  setEditor: (editor) => set(() => ({ editor })),
  setCurrentToolId: (toolId) => set(() => ({ currentToolId: toolId })),
  setSelection: (selection) => set(() => ({ selection })),
}));
