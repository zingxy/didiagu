import { Graphics, Container } from 'pixi.js';
import { nanoid } from 'nanoid';

interface IPrimitive {
  // uuid, 对象的唯一id, 来自前端
  uuid: string;
  // 节点类型
  type: string;
}

export abstract class AbstractPrimitive
  extends Container
  implements IPrimitive
{
  uuid: string;
  abstract type: string;

  graphics: Graphics;

  constructor() {
    super();
    this.uuid = nanoid();
    this.graphics = new Graphics();
    this.addChild(this.graphics);
  }
  abstract render(): void;
}

interface INodeConfig {
  x: number;
  y: number;
}
class Node extends AbstractPrimitive {
  type = 'node';
  constructor(config: INodeConfig) {
    super();
    this.x = config.x;
    this.y = config.y;
    this.render();
  }

  render(): void {
    this.graphics.clear();
    this.graphics.circle(0, 0, 15).fill('black');
  }
}

interface IEdgeConfig {
  from: Node;
  to: Node;
}

class Edge extends AbstractPrimitive {
  type = 'edge';
  from: Node;
  to: Node;
  constructor(config: IEdgeConfig) {
    const { from, to } = config;
    super();
    this.from = from;
    this.to = to;
    this.render();
  }
  render() {
    this.graphics.clear();
    this.graphics.moveTo(this.from.x, this.from.y);
    this.graphics.lineTo(this.to.x, this.to.y);
    this.graphics.stroke({ width: 3, color: 'blue' });
  }
}
interface IRectConfig {
  x: number;
  y: number;
}
class Rect extends AbstractPrimitive {
  type = 'rectangle';
  constructor(config: IRectConfig) {
    super();
    this.x = config.x;
    this.y = config.y;
    this.render();
  }
  render(): void {
    this.graphics.clear();
    this.graphics.rect(0, 0, 0, 0).fill('yellow');
  }
}
export { Node, Edge, Rect };
