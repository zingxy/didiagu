import { Application, Container, Graphics, type PointData } from 'pixi.js';
import { Node, Edge, SnapEngine } from './primitive';
import type { Feature, SnapContext, SnapPoint } from './primitive';

class Editor {
  app: Application;
  nodeLayer: Container<Node>;
  edgeLayer: Container<Edge>;
  snapEngine: SnapEngine;
  highlightLayer: Container;
  currentHighlight: Graphics | null = null;

  constructor() {
    this.app = new Application();
    this.snapEngine = new SnapEngine();
    this.nodeLayer = new Container<Node>();
    this.edgeLayer = new Container<Edge>();
    this.highlightLayer = new Container();
    this.app.stage.addChild(this.nodeLayer);
    this.app.stage.addChild(this.edgeLayer);
    this.app.stage.addChild(this.highlightLayer);
  }

  snap(
    context: SnapContext,
    filter: (feature: Feature) => boolean = () => true
  ) {
    // 清除之前的高亮
    this.clearHighlight();

    let features: Feature[] = [];
    for (const node of this.nodeLayer.children) {
      features.push(...node.getFeatures());
    }
    for (const edge of this.edgeLayer.children) {
      features.push(...edge.getFeatures());
    }
    features = features.filter(filter);
    const candidates = this.snapEngine.generateSnapCandidates(
      context,
      features
    );
    const best = this.snapEngine.pickBest(context.cursor, candidates);

    if (best) {
      this.showHighlight(best);
      console.log('最佳吸附点', best);
    }
  }

  private clearHighlight() {
    if (this.currentHighlight) {
      this.highlightLayer.removeChild(this.currentHighlight);
      this.currentHighlight.destroy();
      this.currentHighlight = null;
    }
  }

  private showHighlight(snapPoint: SnapPoint) {
    // 创建新的高亮图形
    this.currentHighlight = new Graphics();

    // 根据吸附点类型选择不同的高亮样式
    switch (snapPoint.type) {
      case 'endpoint':
        // 端点用实心圆圈
        this.currentHighlight
          .circle(snapPoint.position.x, snapPoint.position.y, 8)
          .fill({ color: 0x00ff00, alpha: 0.8 })
          .circle(snapPoint.position.x, snapPoint.position.y, 8)
          .stroke({ color: 0x00aa00, width: 2 });
        break;

      case 'midpoint': {
        // 中点用菱形
        const size = 6;
        this.currentHighlight
          .poly([
            snapPoint.position.x,
            snapPoint.position.y - size, // 上
            snapPoint.position.x + size,
            snapPoint.position.y, // 右
            snapPoint.position.x,
            snapPoint.position.y + size, // 下
            snapPoint.position.x - size,
            snapPoint.position.y, // 左
          ])
          .fill({ color: 0xffff00, alpha: 0.8 })
          .stroke({ color: 0xcccc00, width: 2 });
        break;
      }

      case 'nearest': {
        // 最近点用十字线
        const crossSize = 10;
        this.currentHighlight
          .moveTo(snapPoint.position.x - crossSize, snapPoint.position.y)
          .lineTo(snapPoint.position.x + crossSize, snapPoint.position.y)
          .moveTo(snapPoint.position.x, snapPoint.position.y - crossSize)
          .lineTo(snapPoint.position.x, snapPoint.position.y + crossSize)
          .stroke({ color: 0xff0000, width: 2, alpha: 0.8 });
        break;
      }
      case 'perpendicular': {
        // 垂直标记：画一个小的直角符号
        const size = 8;
        this.currentHighlight
          .moveTo(snapPoint.position.x - size, snapPoint.position.y)
          .lineTo(snapPoint.position.x, snapPoint.position.y)
          .lineTo(snapPoint.position.x, snapPoint.position.y - size)
          .moveTo(
            snapPoint.position.x - size / 2,
            snapPoint.position.y - size / 2
          )
          .lineTo(snapPoint.position.x - size / 2, snapPoint.position.y)
          .lineTo(snapPoint.position.x, snapPoint.position.y)
          .stroke({ color: 0xff6600, width: 2, alpha: 0.9 });
        break;
      }
    }

    this.highlightLayer.addChild(this.currentHighlight);
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

    let fromNode: Node | null = null;
    let toNode: Node | null = null;
    let edgeInProgress: Edge | null = null;
    this.app.stage.on('pointerdown', (event) => {
      fromNode = new Node({ x: event.global.x, y: event.global.y });
      this.nodeLayer.addChild(fromNode);
    });
    // 监听鼠标移动事件, 进行吸附计算
    this.app.stage.on('pointermove', (event) => {
      if (fromNode) {
        toNode = toNode ?? new Node({ x: event.global.x, y: event.global.y });
        edgeInProgress =
          edgeInProgress ?? new Edge({ from: fromNode, to: toNode });
        edgeInProgress.render();
        toNode.x = event.global.x;
        toNode.y = event.global.y;
        this.nodeLayer.addChild(toNode);
        this.edgeLayer.addChild(edgeInProgress);
      }

      this.snap(
        {
          cursor: event.global,
          currentLine: edgeInProgress
            ? {
                from: { x: edgeInProgress.from.x, y: edgeInProgress.from.y },
                to: { x: edgeInProgress.to.x, y: edgeInProgress.to.y },
              }
            : undefined,
        },
        (feature) =>
          feature !== fromNode &&
          feature !== edgeInProgress &&
          feature !== toNode
      );
    });

    this.app.stage.on('pointerup', (event) => {
      fromNode = null;
      toNode = null;
      edgeInProgress = null;
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
    this.clearHighlight();
    this.app.destroy();
  };
}

export { Editor };
