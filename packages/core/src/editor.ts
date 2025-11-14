import {
  Application,
  type ApplicationOptions,
  FederatedPointerEvent,
} from 'pixi.js';
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
  antialias: true,
};

export class Editor extends EventBus {
  private readonly app: Application;
  readonly bus: EventBus;
  readonly camera: Camera;
  readonly sceneGraph: SceneGraph;
  private toolManager: ToolManager;
  options: EditorOptions;
  constructor(options: EditorOptions = defaultEditorOptions) {
    super();
    this.app = new Application();
    this.bus = this;
    this.sceneGraph = new SceneGraph(this, this.app.stage);
    this.camera = new Camera(this);
    this.toolManager = new ToolManager(this);
    this.options = { ...defaultEditorOptions, ...options };
  }

  init = async () => {
    // Initialization logic here
    await this.app.init(this.options);
    this.app.stage.eventMode = 'static';
    this.app.stage.interactive = true;
    // 设置一个足够大的 hitArea，覆盖整个应用区域
    // 注意：这是相对于 app.view 的，不受 stage.localTransform 影响
    this.app.stage.hitArea = this.app.screen;
    this.bindEvents();
    this.emit('editor.initialized');
  };

  /** 统一的事件绑定 - 实现事件优先级处理 */
  private bindEvents() {
    this.app.stage.on('pointerdown', this.handlePointerDown, this);
    this.app.stage.on('pointermove', this.handlePointerMove, this);
    this.app.stage.on('pointerup', this.handlePointerUp, this);
    this.app.stage.on('pointerupoutside', this.handlePointerUp, this);
  }

  /** 统一处理指针按下事件 - Camera 优先 */
  private handlePointerDown = (e: FederatedPointerEvent) => {
    // Camera 优先处理（中键或空格+左键）
    if (this.camera.handlePointerDown(e)) {
      return;
    }
    // Camera 不处理则传递给工具
    this.toolManager.handlePointerDown(e);
  };

  /** 统一处理指针移动事件 */
  private handlePointerMove = (e: FederatedPointerEvent) => {
    // Camera 优先处理
    if (this.camera.handlePointerMove(e)) {
      return;
    }
    // Camera 不处理则传递给工具
    this.toolManager.handlePointerMove(e);
  };

  /** 统一处理指针释放事件 */
  private handlePointerUp = (e: FederatedPointerEvent) => {
    // Camera 优先处理
    if (this.camera.handlePointerUp()) {
      return;
    }
    // Camera 不处理则传递给工具
    this.toolManager.handlePointerUp(e);
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
