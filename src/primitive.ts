import { Graphics, Container, type PointData } from 'pixi.js';
import { nanoid } from 'nanoid';

interface IPrimitive {
  // uuid, 对象的唯一id, 来自前端
  uuid: string;
  // 业务元素唯一id, 来自数据库
  objectId?: string;
  // 表示当前的图形类型,
  tag: string;
}

abstract class AbstractPrimitive extends Container implements IPrimitive {
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
}

interface INodeConfig {
  objectId?: string;
  x: number;
  y: number;
}
class Node extends AbstractPrimitive implements PointFeature, FeatureProvider {
  tag = 'node';
  type = 'point' as const;
  constructor(config: INodeConfig) {
    super({ objectId: config?.objectId });
    this.x = config.x;
    this.y = config.y;
    this.render();
  }
  render(): void {
    this.graphics.clear();
    this.graphics.circle(0, 0, 15).fill('black');
  }

  // PointFeature 方法实现
  getPosition(): PointData {
    return { x: this.x, y: this.y };
  }
  distanceTo(other: PointFeature): number {
    const dx = this.x - other.getPosition().x;
    const dy = this.y - other.getPosition().y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  // FeatureProvider 方法实现
  getFeatures(): Feature[] {
    return [this];
  }
}

interface IEdgeConfig {
  objectId?: string;
  from: Node;
  to: Node;
}

class Edge extends AbstractPrimitive implements EdgeFeature, FeatureProvider {
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
    return [this];
  }
  // EdgeFeature 方法实现
  getStart(): PointData {
    return { x: this.from.x, y: this.from.y };
  }
  getEnd(): PointData {
    return { x: this.to.x, y: this.to.y };
  }

  nearest(p: PointData): PointData {
    // 点到线段的最近点计算
    const A = this.getStart();
    const B = this.getEnd();

    const AP = { x: p.x - A.x, y: p.y - A.y };
    const AB = { x: B.x - A.x, y: B.y - A.y };

    const ab2 = AB.x * AB.x + AB.y * AB.y;
    const ap_ab = AP.x * AB.x + AP.y * AB.y;

    let t = ap_ab / ab2;
    // TODO 支持延长捕捉
    t = Math.max(0, Math.min(1, t)); // 限制在线段上

    return {
      x: A.x + AB.x * t,
      y: A.y + AB.y * t,
    };
  }
  midPoint(): PointData {
    return {
      x: (this.from.x + this.to.x) / 2,
      y: (this.from.y + this.to.y) / 2,
    };
  }
  length(): number {
    const dx = this.to.x - this.from.x;
    const dy = this.to.y - this.from.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

export { Node, Edge };

export interface SnapPoint {
  type: 'endpoint' | 'midpoint' | 'nearest' | 'perpendicular';
  position: PointData;
  feature: Feature;
}

export interface SnapContext {
  cursor: PointData;
  currentLine?: {
    from: PointData;
    to: PointData;
  };
  excludeFeature?: Feature[];
}

export class SnapEngine {
  tolerance = 10; // 吸附容差距离, 10px

  generateSnapCandidates(
    context: SnapContext,
    features: Feature[]
  ): SnapPoint[] {
    const endpointSnap = new EndPointSnap();
    const midpointSnap = new MidPointSnap();
    const nearestPointSnap = new NearestPointSnap();

    const candidates: SnapPoint[] = [];
    candidates.push(...endpointSnap.compute(context, features));
    candidates.push(...midpointSnap.compute(context, features));
    candidates.push(...nearestPointSnap.compute(context, features));
    return candidates;
  }

  pickBest(cursor: PointData, candidates: SnapPoint[]): SnapPoint | null {
    let best: SnapPoint | null = null;
    let minDist = Infinity;

    for (const candidate of candidates) {
      const dist = this.distance(candidate.position, cursor);
      if (dist <= this.tolerance && dist < minDist) {
        minDist = dist;
        best = candidate;
      }
    }

    return best;
  }
  distance(p1: PointData, p2: PointData): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

abstract class SnapStrategy {
  abstract name: SnapPoint['type'];
  abstract isApplicable(context: SnapContext): boolean;
  abstract compute(cursor: SnapContext, features: Feature[]): SnapPoint[];
}

class EndPointSnap extends SnapStrategy {
  name = 'endpoint' as const;
  constructor() {
    super();
    this.name = 'endpoint';
  }
  isApplicable(context: SnapContext): boolean {
    return !!context.cursor;
  }
  // 计算端点吸附
  compute(context: SnapContext, features: Feature[]): SnapPoint[] {
    const snaps: SnapPoint[] = [];
    for (const feature of features) {
      if (feature.type === 'edge') {
        const edge = feature as EdgeFeature;
        snaps.push({
          type: 'endpoint',
          position: edge.getStart(),
          feature: edge,
        });
        snaps.push({
          type: 'endpoint',
          position: edge.getEnd(),
          feature: edge,
        });
      }
      if (feature.type === 'point') {
        const point = feature as PointFeature;
        snaps.push({
          type: 'endpoint',
          position: point.getPosition(),
          feature: point,
        });
      }
    }
    return snaps;
  }
}

class MidPointSnap extends SnapStrategy {
  name = 'midpoint' as const;
  constructor() {
    super();
  }
  isApplicable(context: SnapContext): boolean {
    return !!context.cursor;
  }

  compute(context: SnapContext, features: Feature[]): SnapPoint[] {
    const snaps: SnapPoint[] = [];
    for (const feature of features) {
      if (feature.type === 'edge') {
        const edge = feature as EdgeFeature;
        snaps.push({
          type: 'midpoint',
          position: edge.midPoint(),
          feature: edge,
        });
      }
    }
    return snaps;
  }
}

class NearestPointSnap extends SnapStrategy {
  name = 'nearest' as const;
  constructor() {
    super();
  }
  isApplicable(context: SnapContext): boolean {
    return !!context.cursor;
  }
  compute(context: SnapContext, features: Feature[]): SnapPoint[] {
    const snaps: SnapPoint[] = [];
    for (const feature of features) {
      if (feature.type === 'edge') {
        const edge = feature as EdgeFeature;
        snaps.push({
          type: 'nearest',
          position: edge.nearest(context.cursor),
          feature: edge,
        });
      }
    }
    return snaps;
  }
}

class PerpendicularSnap extends SnapStrategy {
  name = 'perpendicular' as const;
  constructor() {
    super();
  }
  isApplicable(context: SnapContext): boolean {
    return !!context.cursor && !!context.currentLine;
  }
  compute(context: SnapContext, features: Feature[]): SnapPoint[] {
    const snaps: SnapPoint[] = [];
    const currentLine = context.currentLine!;
    for (const feature of features) {
      if (feature.type === 'edge') {
        const edge = feature as EdgeFeature;
        // 计算一下两条线的垂足
        const foot = this.getPerpendicularFoot(currentLine, edge);
        if (foot) {
          snaps.push({
            type: 'perpendicular',
            position: foot,
            feature: edge,
          });
        }
      }
    }
    return snaps;
  }

  private getPerpendicularFoot(
    line: { start: PointData; end: PointData },
    edge: EdgeFeature
  ): PointData | null {
    // 计算垂足的逻辑
    return null;
  }
}

// 边特征接口, 用于几何计算
interface EdgeFeature {
  type: 'edge';
  // 获取边的起点坐标
  getStart(): PointData;
  // 获取边的终点坐标
  getEnd(): PointData;
  // 计算边上距离点p最近的点，欧式距离
  nearest(p: PointData): PointData;
  // 计算边的中点坐标
  midPoint(): PointData;
  // 计算边的长度，欧式距离
  length(): number;
}

// 点特征接口, 用于几何计算
interface PointFeature {
  type: 'point';
  getPosition(): PointData;
  distanceTo(other: PointFeature): number;
}

// 面特征接口, 用于几何计算
// interface FaceFeature {
//   type: 'face';
//   // 获取面的质心坐标
//   getCentroid(): PointData;
// }

export type Feature = EdgeFeature | PointFeature;
interface FeatureProvider {
  getFeatures(): Feature[];
}
