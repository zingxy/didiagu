import { Application, type ApplicationOptions } from 'pixi.js';
import { Camera } from './camera';
import { EventBus } from './event-bus';
import { SceneGraph } from './scene-graph';
import { ToolManager } from './tool-manager';
import { Dispatcher } from './dispatcher';
import { SelectionManager } from './selection';
import { ActionManager } from './action-manager';

export interface EditorEvents {
  // Define editor-specific events here
  'editor.initialized': () => void;
}

interface EditorOptions extends Partial<ApplicationOptions> {
  // Define editor-specific options here
  enableGrid?: boolean;
}

const defaultEditorOptions: EditorOptions = {
  enableGrid: true,
  antialias: true,
};

export class Editor extends EventBus {
  private readonly app: Application;
  public readonly bus: EventBus;
  public readonly camera: Camera;
  public readonly sceneGraph: SceneGraph;
  public readonly toolManager: ToolManager;
  public readonly dispatcher: Dispatcher;
  public readonly selectionManager: SelectionManager;
  public readonly actionManager: ActionManager;
  options: EditorOptions;
  constructor(options: EditorOptions = defaultEditorOptions) {
    super();
    this.app = new Application();
    this.bus = this;
    this.sceneGraph = new SceneGraph(this, this.app.stage);
    this.camera = new Camera(this);
    this.dispatcher = new Dispatcher(this.app.stage);
    this.toolManager = new ToolManager(this);
    this.selectionManager = new SelectionManager(this);
    this.actionManager = new ActionManager(this);

    this.options = { ...defaultEditorOptions, ...options };

    this.dispatcher.addHandler(this.camera, this.toolManager);
  }

  init = async () => {
    // Initialization logic here
    await this.app.init(this.options);
    this.app.stage.eventMode = 'static';
    this.app.stage.interactive = true;
    this.app.stage.hitArea = this.app.screen;
    this.actionManager.registerActions();
    this.emit('editor.initialized');
  };

  /**
   * @param toolId 工具id
   */
  setCurrentTool = (toolId: string) => {
    this.toolManager.setCurrentTool(toolId);
  };

  getCurrentToolId = () => {
    return this.toolManager.getCurrentToolId();
  };

  destroy = () => {
    this.app.destroy();
  };
}
