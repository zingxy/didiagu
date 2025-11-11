import { Application } from 'pixi.js';
import { Rect } from './primitives';

export class Editor {
  app: Application;
  constructor() {
    this.app = new Application();
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
    const rect = new Rect({ x: 100, y: 100, w: 200, h: 150 });
    this.app.stage.addChild(rect); // 添加内部容器
  };

  destroy = () => {
    this.app.destroy();
  };
}
