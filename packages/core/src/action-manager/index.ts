import { Editor } from '../editor';

interface Action {
  name: string;
  label: string;
  keywords?: string[];
  perform: ({ editor }: { editor: Editor }) => void;
  keyTest?: (e: KeyboardEvent) => boolean;
}
export const preloadActions: Action[] = [];

export const registerActions = (...newActions: Action[]) => {
  preloadActions.push(...newActions);
};
export class ActionManager {
  private actions: Map<string, Action>;
  private editor: Editor;
  constructor(editor: Editor) {
    this.actions = new Map();
    this.editor = editor;
    window.addEventListener('keydown', this.handleKeydown);
    this.registerActions(...preloadActions);
  }
  handleKeydown = (e: KeyboardEvent) => {
    const actions = [...this.actions.values()];
    const filteredActions = actions.filter((action) =>
      action.keyTest ? action.keyTest(e) : false
    );
    if (filteredActions.length === 0) return;
    if (filteredActions.length > 1) {
      console.warn(
        'Multiple actions matched the same key combination:',
        filteredActions.map((a) => a.name)
      );
      return;
    }
    e.preventDefault();
    filteredActions[0].perform({ editor: this.editor });
  };

  registerActions(...newActions: Action[]) {
    newActions.forEach((action) => {
      if (this.actions.has(action.name)) {
        console.warn(
          `Action with name "${action.name}" is already registered.`
        );
      }
      console.log('Registering action:', action.name);
      this.actions.set(action.name, action);
    });
  }

  unregisterAction(actionName: string) {
    this.actions.delete(actionName);
  }
}
