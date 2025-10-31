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
    // 定义优先级顺序：数字越小优先级越高
    const priorityOrder = {
      midpoint: 1, // 中点优先级最高
      endpoint: 2, // 端点次之
      perpendicular: 3, // 垂直吸附
      nearest: 4, // 最近点优先级最低
    };

    // 筛选出在容差范围内的候选点
    const validCandidates = candidates
      .map((candidate) => ({
        ...candidate,
        distance: this.distance(candidate.position, cursor),
        priority: priorityOrder[candidate.type],
      }))
      .filter((candidate) => candidate.distance <= this.tolerance);

    if (validCandidates.length === 0) {
      return null;
    }

    // 按优先级排序，优先级相同时按距离排序
    validCandidates.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // 优先级排序
      }
      return a.distance - b.distance; // 距离排序
    });

    return validCandidates[0];
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
    return !!context.currentLine;
  }
  compute(context: SnapContext, features: Feature[]): SnapPoint[] {
    const snaps: SnapPoint[] = [];
    for (const feature of features) {
      if (feature.type === 'edge') {
        const edge = feature as EdgeFeature;

        if (context.currentLine) {
          // 简化的垂直吸附逻辑：直接使用鼠标位置到边的最近点
          const { from } = context.currentLine;
          const foot = edge.nearest(context.cursor);

          // 当前绘制方向向量
          const currentDir = {
            x: context.cursor.x - from.x,
            y: context.cursor.y - from.y,
          };

          // 目标边的方向向量
          const edgeStart = edge.getStart();
          const edgeEnd = edge.getEnd();
          const edgeDir = {
            x: edgeEnd.x - edgeStart.x,
            y: edgeEnd.y - edgeStart.y,
          };

          // 计算当前方向与目标边的夹角
          const currentLength = Math.sqrt(
            currentDir.x * currentDir.x + currentDir.y * currentDir.y
          );
          const edgeLength = Math.sqrt(
            edgeDir.x * edgeDir.x + edgeDir.y * edgeDir.y
          );

          if (currentLength > 10 && edgeLength > 0) {
            const dot = Math.abs(
              currentDir.x * edgeDir.x + currentDir.y * edgeDir.y
            );
            const cosAngle = dot / (currentLength * edgeLength);

            // 如果接近垂直（夹角在75°-105°之间），提供垂直吸附
            if (cosAngle < 0.25) {
              // cos(75°) ≈ 0.25
              snaps.push({
                type: 'perpendicular',
                position: foot,
                feature: edge,
              });
              continue;
            }
          }
        }

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
