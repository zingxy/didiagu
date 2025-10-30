import { Application, Container } from 'pixi.js';
import { Node, Edge } from './primitive';

class Editor {
  app: Application;
  nodeLayer: Container<Node>;
  edgeLayer: Container<Edge>;

  constructor() {
    this.app = new Application();
    this.nodeLayer = new Container<Node>();
    this.edgeLayer = new Container<Edge>();
    this.app.stage.addChild(this.nodeLayer);
    this.app.stage.addChild(this.edgeLayer);
  }

  init = async () => {
    // Initialization logic here
    await this.app.init({
      background: '#6c797c38',
      width: 1000,
      height: 600,
      antialias: true,
    });

    const data = {
      nodes: [
        { id: 'node1', x: 100, y: 100 },
        { id: 'node2', x: 400, y: 300 },
        { id: 'node3', x: 700, y: 150 },
        { id: 'node4', x: 300, y: 400 },
      ],
      edges: [
        { from: 'node1', to: 'node2' },
        {
          from: 'node2',
          to: 'node3',
        },
        { from: 'node1', to: 'node4' },
      ],
    };

    data.nodes.forEach((nodeData) => {
      const node = new Node({
        x: nodeData.x,
        y: nodeData.y,
        objectId: nodeData.id,
      });
      this.nodeLayer.addChild(node);
    });

    data.edges.forEach((edgeData) => {
      const fromNode = this.nodeLayer.children.find(
        (child) => child.objectId === edgeData.from
      );

      const toNode = this.nodeLayer.children.find(
        (child) => child.objectId === edgeData.to
      );

      if (fromNode && toNode) {
        const edge = new Edge({
          from: fromNode,
          to: toNode,
          objectId: `${edgeData.from}-${edgeData.to}`,
        });
        this.edgeLayer.addChild(edge);
      }
    });
  };

  destroy = () => {
    this.app.destroy();
  };
}

export { Editor };
