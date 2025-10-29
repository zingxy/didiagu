import { Graphics, Container } from 'pixi.js';

interface Primitive {
  shapeId: string | number;
}

class Node extends Container implements Primitive {
  shapeId: Primitive['shapeId'];
  constructor({
    x,
    y,
    id,
  }: {
    x: number;
    y: number;
    id: Primitive['shapeId'];
  }) {
    super();
    this.shapeId = id;
    const circle = new Graphics().circle(0, 0, 5).fill('blue');
    this.position.set(x, y);
    this.addChild(circle);
  }
}

class Edge extends Container implements Primitive {
  shapeId: Primitive['shapeId'];
  constructor({
    from,
    to,
    id,
  }: {
    from: Node;
    to: Node;
    id: Primitive['shapeId'];
  }) {
    super();
    this.shapeId = id;
    console.log('Creating edge from', from.position, 'to', to.position);
    const line = new Graphics()
      .moveTo(from.position.x, from.position.y)
      .lineTo(to.position.x, to.position.y)
      .stroke({ color: 'black', width: 2 });
    this.addChild(line);
  }
}

export { Node, Edge };
