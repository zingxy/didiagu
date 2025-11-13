import { Application, type ApplicationOptions } from 'pixi.js';
import { Camera } from './camera';
import { EventBus } from './event-bus';
import { SceneGraph } from './scene-graph';
import { ToolManager } from './tool-manager';

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
};

export class Editor extends EventBus {
  readonly app: Application;
  readonly bus: EventBus;
  readonly camera: Camera;
  readonly sceneGraph: SceneGraph;
  private toolManager: ToolManager;
  options: EditorOptions;
  constructor(options: EditorOptions = defaultEditorOptions) {
    super();
    this.app = new Application();
    this.bus = this;
    this.sceneGraph = new SceneGraph(this);
    this.camera = new Camera(this);
    this.toolManager = new ToolManager(this);
    this.options = options;
  }

  init = async () => {
    // Initialization logic here
    await this.app.init(this.options);
    this.app.stage.eventMode = 'static';
    this.app.stage.interactive = true;
    this.app.stage.hitArea = this.app.screen;
    this.emit('editor.initialized');
  };

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
