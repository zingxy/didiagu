import { Graphics, Container } from 'pixi.js';
import { nanoid } from 'nanoid';
import { LineImpl, type Feature } from './snap';
import type { FeatureProvider } from './snap';

interface IPrimitive {
  // uuid, 对象的唯一id, 来自前端
  uuid: string;
  // 业务元素唯一id, 来自数据库
  objectId?: string;
  // 表示当前的图形类型,
  tag: string;
}

export abstract class AbstractPrimitive
  extends Container
  implements IPrimitive, FeatureProvider
{
  // 唯一标识符
  uuid: string;
  // 业务元素唯一id
  objectId?: string;
  graphics: Graphics;
  abstract tag: string;

  constructor(config?: { objectId?: string }) {
    super();
    this.uuid = nanoid();
    this.objectId = config?.objectId;
    this.graphics = new Graphics();
    this.addChild(this.graphics);
  }
  abstract render(): void;
  abstract getFeatures(): Feature[];
}

interface INodeConfig {
  objectId?: string;
  x: number;
  y: number;
}
class Node extends AbstractPrimitive {
  tag = 'node';
  type = 'point' as const;
  constructor(config: INodeConfig) {
    super({ objectId: config?.objectId });
    this.x = config.x;
    this.y = config.y;
    this.render();
  }

  // FeatureProvider 方法实现
  getFeatures(): Feature[] {
    return [this];
  }
  render(): void {
    this.graphics.clear();
    this.graphics.circle(0, 0, 15).fill('black');
  }
}

interface IEdgeConfig {
  objectId?: string;
  from: Node;
  to: Node;
}

class Edge extends AbstractPrimitive {
  tag = 'edge';
  from: Node;
  to: Node;
  type = 'edge' as const;
  constructor(config: IEdgeConfig) {
    const { from, to, objectId } = config;
    super({ objectId });
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

  // FeatureProvider 方法实现
  getFeatures(): Feature[] {
    return [new LineImpl(this.from.x, this.from.y, this.to.x, this.to.y, this)];
  }
}
interface IRectConfig {
  objectId?: string;
  x: number;
  y: number;
  size: { x: number; y: number };
}
class Rect extends AbstractPrimitive {
  tag = 'rectangle' as const;
  size: { x: number; y: number };
  constructor(config: IRectConfig) {
    super({ objectId: config?.objectId });
    this.x = config.x;
    this.y = config.y;
    this.size = config.size;
    this.render();
  }

  getFeatures(): Feature[] {
    return [
      new Node({ x: this.x, y: this.y }),
      new Node({ x: this.x + this.size.x, y: this.y }),
      new Node({ x: this.x, y: this.y + this.size.y }),
      new Node({ x: this.x + this.size.x, y: this.y + this.size.y }),
      new LineImpl(this.x, this.y, this.x + this.size.x, this.y, this),
      new LineImpl(
        this.x + this.size.x,
        this.y,
        this.x + this.size.x,
        this.y + this.size.y,
        this
      ),
      new LineImpl(
        this.x + this.size.x,
        this.y + this.size.y,
        this.x,
        this.y + this.size.y,
        this
      ),
      new LineImpl(this.x, this.y + this.size.y, this.x, this.y, this),
      // 水平中线
      new LineImpl(
        this.x,
        this.y + this.size.y / 2,
        this.x + this.size.x,
        this.y + this.size.y / 2,
        this
      ),
      // 垂直中线
      new LineImpl(
        this.x + this.size.x / 2,
        this.y,
        this.x + this.size.x / 2,
        this.y + this.size.y,
        this
      ),
    ];
  }

  render(): void {
    this.graphics.clear();
    this.graphics.rect(0, 0, this.size.x, this.size.y).fill('yellow');
  }
}
export { Node, Edge, Rect };
