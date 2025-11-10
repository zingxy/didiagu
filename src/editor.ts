import { Application, Container, Graphics } from 'pixi.js';
import { Node, Edge, Rect, AbstractPrimitive } from './primitive';
import type { Feature, LineImpl, RefContext, RefItem } from './snap';
import { isLineFeature, RefEngine } from './snap';
import type { Ref } from 'react';

class Editor {
  app: Application;
  nodeLayer: Container<Node>;
  edgeLayer: Container<Edge>;
  primitiveLayer: Container<AbstractPrimitive>;
  snapEngine: RefEngine;
  highlightLayer: Container;
  currentHighlight: Graphics | null = null;

  constructor() {
    this.app = new Application();
    this.snapEngine = new RefEngine();
    this.nodeLayer = new Container<Node>();
    this.edgeLayer = new Container<Edge>();
    this.primitiveLayer = new Container<AbstractPrimitive>();
    this.highlightLayer = new Container();
    this.app.stage.addChild(this.nodeLayer);
    this.app.stage.addChild(this.edgeLayer);
    this.app.stage.addChild(this.primitiveLayer);
    this.app.stage.addChild(this.highlightLayer);
  }

  snap(context: RefContext, excludes: AbstractPrimitive[]) {
    // 清除之前的高亮
    this.clearHighlight();

    const features: Feature[] = [];
    for (const node of this.nodeLayer.children) {
      features.push(...node.getFeatures());
    }
    for (const edge of this.edgeLayer.children) {
      features.push(...edge.getFeatures());
    }
    for (const primitive of this.primitiveLayer.children) {
      if (excludes.includes(primitive)) {
        continue;
      }
      features.push(...primitive.getFeatures());
    }
    const candidates = this.snapEngine.compute({ ...context, features });
    this.showHighlight(candidates);
  }

  private clearHighlight() {
    if (this.currentHighlight) {
      this.highlightLayer.removeChild(this.currentHighlight);
      this.currentHighlight.destroy();
      this.currentHighlight = null;
    }
  }

  private showHighlight(items: RefItem[]) {
    // 创建新的高亮图形
    this.currentHighlight = new Graphics();

    // 根据吸附点类型选择不同的高亮样式
    for (const item of items) {
      if (item.type === 'refline') {
        const line = item.provider as LineImpl;
        this.currentHighlight
          .moveTo(line.x1, line.y1)
          .lineTo(line.x2, line.y2)
          .stroke({ width: 1, color: 0xff0000 });
        // 在端点画一个 ×
        const drawX = (x: number, y: number, size = 5) => {
          this.currentHighlight!.moveTo(x - size, y - size)
            .lineTo(x + size, y + size)
            .moveTo(x + size, y - size)
            .lineTo(x - size, y + size)
            .stroke({ width: 1, color: 0xff0000 });
        };
        drawX(line.x1, line.y1);
        drawX(line.x2, line.y2);
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
    let rectInProgress: Rect | null = null;
    let rectStartPos: { x: number; y: number } = { x: 0, y: 0 };
    this.app.stage.on('pointerdown', (event) => {
      fromNode = new Node({ x: event.global.x, y: event.global.y });
      rectInProgress = new Rect({
        x: event.global.x,
        y: event.global.y,
        size: { x: 100, y: 100 },
      });
      // this.nodeLayer.addChild(fromNode);
      rectStartPos = { x: event.global.x, y: event.global.y };
      this.primitiveLayer.addChild(rectInProgress);
    });
    // 监听鼠标移动事件, 进行吸附计算
    this.app.stage.on('pointermove', (event) => {
      // if (fromNode) {
      //   toNode = toNode ?? new Node({ x: event.global.x, y: event.global.y });
      //   edgeInProgress =
      //     edgeInProgress ?? new Edge({ from: fromNode, to: toNode });
      //   edgeInProgress.render();
      //   toNode.x = event.global.x;
      //   toNode.y = event.global.y;
      //   this.nodeLayer.addChild(toNode);
      //   this.edgeLayer.addChild(edgeInProgress);
      // }
      if (rectInProgress) {
        rectInProgress.x += event.global.x - rectStartPos.x;
        rectInProgress.y += event.global.y - rectStartPos.y;
        rectStartPos = { x: event.global.x, y: event.global.y };
        rectInProgress.render();

        this.snap(
          {
            cursor: event.global,
            linesToSnap: rectInProgress.getFeatures().filter(isLineFeature),
            features: [],
          },
          [rectInProgress]
        );
      }

      // this.snap(
      //   {
      //     cursor: event.global,
      //     currentLine: edgeInProgress
      //       ? {
      //           from: { x: edgeInProgress.from.x, y: edgeInProgress.from.y },
      //           to: { x: edgeInProgress.to.x, y: edgeInProgress.to.y },
      //         }
      //       : undefined,
      //   },
      //   (feature) =>
      //     feature !== fromNode &&
      //     feature !== edgeInProgress &&
      //     feature !== toNode
      // );
    });

    this.app.stage.on('pointerup', () => {
      fromNode = null;
      toNode = null;
      edgeInProgress = null;
      rectInProgress = null;
    });

    const data = {
      nodes: [
        { id: 'node1', x: 100, y: 100 },
        { id: 'node2', x: 200, y: 200 },
        { id: 'node3', x: 700, y: 150 },
        { id: 'node4', x: 300, y: 300 },
      ],
      edges: [
        { from: 'node1', to: 'node2' },
        {
          from: 'node2',
          to: 'node3',
        },
        { from: 'node1', to: 'node4' },
      ],
      rects: [
        {
          id: 'rect1',
          x: 500,
          y: 400,
          size: { x: 100, y: 100 },
        },
        {
          id: 'rect2',
          x: 100,
          y: 100,
          size: { x: 100, y: 100 },
        },
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
    data.rects.forEach((rectData) => {
      const rect = new Rect({
        x: rectData.x,
        y: rectData.y,
        size: rectData.size,
        objectId: rectData.id,
      });
      this.primitiveLayer.addChild(rect);
    });
  };

  destroy = () => {
    this.clearHighlight();
    this.app.destroy();
  };
}

export { Editor };
