export interface RefItem {
  type: 'endpoint' | 'midpoint' | 'nearest' | 'perpendicularFoot' | 'refline';
  // 是谁提供的ref
  provider: Feature;
  // 提供给to作为参考
  to: Feature;
}

export interface RefContext {
  cursor: Point;
  linesToSnap: Line[];
  features: Feature[];
}

export class RefEngine {
  tolerance = 1; // 吸附容差距离, 10px

  compute(context: RefContext): RefItem[] {
    const refLineSnap = new RefLineSnap();
    const candidates: RefItem[] = [];
    candidates.push(...refLineSnap.compute(context));
    return candidates;
  }

  /*
  pickBest(cursor: Point, candidates: RefItem[]): RefItem | null {
    // 定义优先级顺序：数字越小优先级越高
    const priorityOrder = {
      refline: 0, // 参考线优先级最高
      midpoint: 1, // 中点优先级高
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
  */
}

abstract class RefStrategy {
  abstract compute(context: RefContext): RefItem[];
}
/*
class EndPointSnap extends RefStrategy {
  name = 'endpoint' as const;
  constructor() {
    super();
    this.name = 'endpoint';
  }
  // 计算端点吸附
  compute(context: RefContext, features: Feature[]): RefItem[] {
    const snaps: RefItem[] = [];
    for (const feature of features) {
      if (feature.type === 'edge') {
        const edge = feature as LineFeature;
        snaps.push({
          type: 'endpoint',
          position: edge.getStart(),
          provider: edge,
        });
        snaps.push({
          type: 'endpoint',
          position: edge.getEnd(),
          provider: edge,
        });
      }
      if (feature.type === 'point') {
        const point = feature as PointFeature;
        snaps.push({
          type: 'endpoint',
          position: point.getPosition(),
          provider: point,
        });
      }
    }
    return snaps;
  }
}

class MidPointSnap extends RefStrategy {
  name = 'midpoint' as const;
  constructor() {
    super();
  }

  compute(context: RefContext, features: Feature[]): RefItem[] {
    const snaps: RefItem[] = [];
    for (const feature of features) {
      if (feature.type === 'edge') {
        const edge = feature as LineFeature;
        snaps.push({
          type: 'midpoint',
          position: edge.midPoint(),
          provider: edge,
        });
      }
    }
    return snaps;
  }
}

class NearestPointSnap extends RefStrategy {
  name = 'nearest' as const;
  constructor() {
    super();
  }
  compute(context: RefContext, features: Feature[]): RefItem[] {
    const snaps: RefItem[] = [];
    for (const feature of features) {
      if (feature.type === 'edge') {
        const edge = feature as LineFeature;

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
                type: 'perpendicularFoot',
                position: foot,
                provider: edge,
              });
              continue;
            }
          }
        }

        snaps.push({
          type: 'nearest',
          position: edge.nearest(context.cursor),
          provider: edge,
        });
      }
    }
    return snaps;
  }
}
*/
class RefLineSnap extends RefStrategy {
  name = 'refline' as const;
  constructor() {
    super();
  }
  compute(context: RefContext): RefItem[] {
    const linesToSnap = context.linesToSnap || [];
    const linesFeatures = context.features.filter(isLineFeature) as Line[];

    const snaps: RefItem[] = [];
    for (const src of linesToSnap) {
      for (const lineFeature of linesFeatures) {
        // 判断是否共线
        const A = { x: lineFeature.x1, y: lineFeature.y1 };
        const B = { x: lineFeature.x2, y: lineFeature.y2 };

        const AB = { x: B.x - A.x, y: B.y - A.y };
        const lengthAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
        if (lengthAB === 0) continue;

        const dirAB = { x: AB.x / lengthAB, y: AB.y / lengthAB };

        const AP1 = { x: src.x1 - A.x, y: src.y1 - A.y };
        const AP2 = { x: src.x2 - A.x, y: src.y2 - A.y };

        const cross1 = AP1.x * dirAB.y - AP1.y * dirAB.x;
        const cross2 = AP2.x * dirAB.y - AP2.y * dirAB.x;

        // 如果两个点的叉积接近0，说明共线
        const tolerance = 1; // 允许的误差范围
        if (Math.abs(cross1) < tolerance && Math.abs(cross2) < tolerance) {
          snaps.push({
            type: 'refline',
            provider: lineFeature,
            to: src,
          });
        }
      }
    }
    return snaps;
  }
}

// 边特征接口, 用于几何计算

export const isLineFeature = (feature: Feature): feature is Line => {
  return (
    'x1' in feature && 'y1' in feature && 'x2' in feature && 'y2' in feature
  );
};

export const isPointFeature = (feature: Point): feature is Point => {
  return 'x' in feature && 'y' in feature;
};

interface Point {
  x: number;
  y: number;
  owner?: unknown;
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  owner?: unknown;
  // 计算边上距离点p最近的点，欧式距离
  nearest(p: Point): Point;
  // 计算边的中点坐标
  midPoint(): Point;
}

export class LineImpl implements Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  owner?: unknown;

  constructor(x1: number, y1: number, x2: number, y2: number, owner?: unknown) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.owner = owner;
  }

  nearest(p: Point): Point {
    const A = { x: this.x1, y: this.y1 };
    const B = { x: this.x2, y: this.y2 };

    const AP = { x: p.x - A.x, y: p.y - A.y };
    const AB = { x: B.x - A.x, y: B.y - A.y };

    const ab2 = AB.x * AB.x + AB.y * AB.y;
    const ap_ab = AP.x * AB.x + AP.y * AB.y;

    let t = ap_ab / ab2;
    t = Math.max(0, Math.min(1, t)); // 限制在线段上

    return {
      x: A.x + AB.x * t,
      y: A.y + AB.y * t,
    };
  }

  midPoint(): Point {
    return {
      x: (this.x1 + this.x2) / 2,
      y: (this.y1 + this.y2) / 2,
    };
  }
}

// 点特征接口, 用于几何计算
export interface PointFeature {
  type: 'point';
  getPosition(): Point;
}

export type Feature = Line | Point;

export interface FeatureProvider {
  getFeatures(): Feature[];
}
