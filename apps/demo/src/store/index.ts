// store.ts
import type { Editor } from '@didiagu/core';
import { create } from 'zustand';

// Define types for state & actions
interface AppState {
  editor: Editor | null;
  currentToolId: string | null;
  setEditor: (editor: Editor | null) => void;
  setCurrentToolId: (toolId: string | null) => void;
}

// Create store using the curried form of `create`
export const useAppState = create<AppState>()((set) => ({
  editor: null,
  currentToolId: null,
  setEditor: (editor) => set(() => ({ editor })),
  setCurrentToolId: (toolId) => set(() => ({ currentToolId: toolId })),
}));
