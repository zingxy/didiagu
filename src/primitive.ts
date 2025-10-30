import { Graphics, Container } from 'pixi.js';
import { nanoid } from 'nanoid';

interface IPrimitive {
  // uuid, 构造对象的唯一id
  uuid: string;
  // 业务元素唯一id
  objectId?: string;
  // pose edge curve rect
  tag: string;
}

abstract class AbstractPrimitive extends Container implements IPrimitive {
  // 唯一标识符
  uuid: string;
  // 业务元素唯一id
  objectId?: string;
  abstract tag: string;
  constructor(config?: { objectId?: string }) {
    super();
    this.uuid = nanoid();
    this.objectId = config?.objectId;
  }
}

interface INodeConfig {
  objectId?: string;
  x: number;
  y: number;
}
class Node extends AbstractPrimitive {
  tag = 'node';
  constructor(config: INodeConfig) {
    super({ objectId: config?.objectId });
    const dot = new Graphics().circle(0, 0, 5).fill('red');
    this.x = config.x;
    this.y = config.y;
    this.addChild(dot);
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
  constructor(config: IEdgeConfig) {
    const { from, to, objectId } = config;
    super({ objectId });
    this.from = from;
    this.to = to;

    const line = new Graphics();
    line.moveTo(from.x, from.y);
    line.lineTo(to.x, to.y);
    line.stroke({ width: 2, color: 'blue' });
    this.addChild(line);
  }
}

export { Node, Edge };
