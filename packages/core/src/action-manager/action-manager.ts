import { Editor } from '..';

interface Action {
  name: string;
  label: string;
  /**
   * optional keywords for searching
   */
  keywords?: string[];
  /**
   * function to perform the action
   */
  perform: ({ editor }: { editor: Editor }) => void|Promise<void>;
  /**
   * optional predicate to determine if action is available
   */
  predicate?: ({ editor }: { editor: Editor }) => boolean;
  /**
   * keyboard event test function
   */
  keyTest?: (e: KeyboardEvent) => boolean;
  /**
   *optional keybinding string for display purposes
   */
  keybinding?: string;
}
export const preloadActions: Action[] = [];
/**
 * register a new action then return it
 * @param newAction
 * @returns
 */

/**
 * register a new action then return it.
 * **must** be called before ActionsManager is instantiated
 * @param newAction
 * @returns
 */
export const registerAction = (newAction: Action) => {
  preloadActions.push(newAction);
  return newAction;
};

/**
 * Actions Manager
 * Managers all action execution and registration. Main purpose is to listen for keyboard events
 * can also manually execute an given action.
 */
export class ActionsManager {
  private actions: Map<string, Action>;
  private editor: Editor;
  constructor(editor: Editor) {
    this.actions = new Map();
    this.editor = editor;
    window.addEventListener('keydown', this.handleKeydown);
    this.registerActions(...preloadActions);
  }
  private handleKeydown = (e: KeyboardEvent) => {
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
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }
    e.preventDefault();
    this.executeAction(filteredActions[0]);
  };

  public executeAction(action: Action) {
    action.perform({ editor: this.editor });
  }

  registerActions(...newActions: Action[]) {
    newActions.forEach((action) => {
      if (this.actions.has(action.name)) {
        console.warn(
          `Action with name "${action.name}" is already registered.`
        );
      }
      this.actions.set(action.name, action);
    });
  }

  unregisterAction(actionName: string) {
    this.actions.delete(actionName);
  }
}
