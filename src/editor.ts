import { Application, Container } from 'pixi.js';
import { Node, Edge, AbstractPrimitive } from './scene';

class Editor {
  app: Application;
  nodeLayer: Container<Node>;
  edgeLayer: Container<Edge>;
  primitiveLayer: Container<AbstractPrimitive>;

  constructor() {
    this.app = new Application();
    this.nodeLayer = new Container<Node>();
    this.edgeLayer = new Container<Edge>();
    this.primitiveLayer = new Container<AbstractPrimitive>();
    this.app.stage.addChild(this.nodeLayer);
    this.app.stage.addChild(this.edgeLayer);
    this.app.stage.addChild(this.primitiveLayer);
  }

  init = async () => {
    // Initialization logic here
    await this.app.init({
      background: '#6c797c38',
      width: 1000,
      height: 600,
      antialias: true,
    });

    // 在应用初始化完成后设置交互和事件监听
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
  };

  destroy = () => {
    this.app.destroy();
  };
}

export { Editor };
