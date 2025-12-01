import { FederatedPointerEvent, Matrix, Bounds } from 'pixi.js';
import { AbstractPrimitive } from './abstract-primitive';
import { Rect } from './shape-rect';
import { IPoint } from '../tool-manager';

interface IContext {
  lastInWorld: IPoint;
  lastInParent: IPoint;
  lastInTransformer: IPoint;

  currentInWorld: IPoint;
  currentInParent: IPoint;
  currentInTransformer: IPoint;

  pivotInWorld: IPoint;
  pivotInParent: IPoint;

  boundingBoxInParent: Bounds;
  boundingBoxInTransformer: Bounds;
  transformer: Transformer;
  /** the **delta** matrix which will apply to the transformer,
   * which means this is a matrix defined in transformers's parent coordinate system.
   * */
  updater: (deltaMatrix: Matrix) => void;
}
interface IHandleConfig {
  handleType: HandleType;
  getPosition(primitive: AbstractPrimitive): { x: number; y: number };
  onPointerdown?(context: Partial<IContext>): void;
  onPointermove?(context: IContext): void;
  onPointerup?(context: Partial<IContext>): void;
}
/**
 * @description 将子元素的变换增量转换为父元素的变换增量，相似矩阵
 * @param childDelta
 * @param localTransform
 * @returns
 */
const childDeltaToParentDelta = (
  childDelta: Matrix,
  localTransform: Matrix
) => {
  return localTransform
    .clone()
    .append(childDelta)
    .append(localTransform.clone().invert());
};

// 缩放配置类型
interface ScaleConfig {
  getScaleX?: (dx: number, w: number) => number;
  getScaleY?: (dy: number, h: number) => number;
  getPivot: (bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }) => { x: number; y: number };
}

// 通用缩放处理函数
function createScaleHandler(config: ScaleConfig) {
  return function (context: IContext) {
    const {
      lastInTransformer,
      currentInTransformer,
      boundingBoxInTransformer: { minX, minY, maxX, maxY },
    } = context;

    const dx = currentInTransformer.x - lastInTransformer.x;
    const dy = currentInTransformer.y - lastInTransformer.y;
    const w = maxX - minX;
    const h = maxY - minY;

    const scaleX = config.getScaleX ? config.getScaleX(dx, w) : 1;
    const scaleY = config.getScaleY ? config.getScaleY(dy, h) : 1;
    const pivot = config.getPivot({ minX, minY, maxX, maxY });

    const t = new Matrix().translate(pivot.x, pivot.y);
    const invertT = t.clone().invert();
    const s = new Matrix().scale(scaleX, scaleY);
    const deltaMatrixInTransformer = t.append(s).append(invertT);

    context.updater(
      childDeltaToParentDelta(
        deltaMatrixInTransformer,
        context.transformer.localTransform
      )
    );
  };
}
type HandleType =
  | 'top-left'
  | 'top-middle'
  | 'top-right'
  | 'middle-right'
  | 'bottom-right'
  | 'bottom-middle'
  | 'bottom-left'
  | 'middle-left'
  | 'rotate'
  | 'mover';
const cpSize = 20;
const offset = cpSize / 2;
const handles: IHandleConfig[] = [
  {
    handleType: 'top-left',
    getPosition() {
      return { x: -offset, y: -offset };
    },
    onPointermove: createScaleHandler({
      getScaleX: (dx, w) => (w - dx) / w,
      getScaleY: (dy, h) => (h - dy) / h,
      getPivot: ({ maxX, maxY }) => ({ x: maxX, y: maxY }),
    }),
  },
  {
    handleType: 'top-middle',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w / 2 - offset, y: -offset };
    },
    onPointermove: createScaleHandler({
      getScaleY: (dy, h) => (h - dy) / h,
      getPivot: ({ minX, maxX, maxY }) => ({ x: (minX + maxX) / 2, y: maxY }),
    }),
  },
  {
    handleType: 'top-right',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w - offset, y: -offset };
    },
    onPointermove: createScaleHandler({
      getScaleX: (dx, w) => (w + dx) / w,
      getScaleY: (dy, h) => (h - dy) / h,
      getPivot: ({ minX, maxY }) => ({ x: minX, y: maxY }),
    }),
  },
  {
    handleType: 'middle-right',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w - offset, y: primitive.h / 2 - offset };
    },
    onPointermove: createScaleHandler({
      getScaleX: (dx, w) => (w + dx) / w,
      getPivot: ({ minX, minY, maxY }) => ({ x: minX, y: (minY + maxY) / 2 }),
    }),
  },
  {
    handleType: 'bottom-right',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w - offset, y: primitive.h - offset };
    },
    onPointermove: createScaleHandler({
      getScaleX: (dx, w) => (w + dx) / w,
      getScaleY: (dy, h) => (h + dy) / h,
      getPivot: ({ minX, minY }) => ({ x: minX, y: minY }),
    }),
  },
  {
    handleType: 'bottom-middle',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w / 2 - offset, y: primitive.h - offset };
    },
    onPointermove: createScaleHandler({
      getScaleY: (dy, h) => (h + dy) / h,
      getPivot: ({ minX, minY, maxX }) => ({ x: (minX + maxX) / 2, y: minY }),
    }),
  },
  {
    handleType: 'bottom-left',
    getPosition(primitive: AbstractPrimitive) {
      return { x: -offset, y: primitive.h - offset };
    },
    onPointermove: createScaleHandler({
      getScaleX: (dx, w) => (w - dx) / w,
      getScaleY: (dy, h) => (h + dy) / h,
      getPivot: ({ minY, maxX }) => ({ x: maxX, y: minY }),
    }),
  },
  {
    handleType: 'middle-left',
    getPosition(primitive: AbstractPrimitive) {
      return { x: -offset, y: primitive.h / 2 - offset };
    },
    onPointermove: createScaleHandler({
      getScaleX: (dx, w) => (w - dx) / w,
      getPivot: ({ minY, maxX, maxY }) => ({ x: maxX, y: (minY + maxY) / 2 }),
    }),
  },
  {
    handleType: 'rotate',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w / 2 - offset, y: -40 - offset };
    },
    onPointermove(context) {
      const { pivotInParent, currentInParent, lastInParent } = context;
      const v1 = {
        x: lastInParent.x - pivotInParent.x,
        y: lastInParent.y - pivotInParent.y,
      };
      const v2 = {
        x: currentInParent.x - pivotInParent.x,
        y: currentInParent.y - pivotInParent.y,
      };
      const angle1 = Math.atan2(v1.y, v1.x);
      const angle2 = Math.atan2(v2.y, v2.x);
      const deltaAngle = angle2 - angle1;

      const t = new Matrix().translate(pivotInParent.x, pivotInParent.y);
      const invertT = t.clone().invert();
      const r = new Matrix().rotate(deltaAngle);
      const deltaMatrix = t.append(r).append(invertT);
      context.updater(deltaMatrix);
    },
  },
  {
    handleType: 'mover',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w / 2 - offset, y: primitive.h / 2 - offset };
    },
    onPointermove(context) {
      const { lastInParent, currentInParent } = context;
      const dx = currentInParent.x - lastInParent.x;
      const dy = currentInParent.y - lastInParent.y;
      const deltaMatrix = new Matrix().translate(dx, dy);
      context.updater(deltaMatrix);
    },
  },
];
export class Handler extends Rect {
  handleType: string;
  handleConfig: IHandleConfig;
  deactivate: () => void;
  activate: (handle: Handler) => void;
  constructor(
    handleConfig: IHandleConfig,
    activate: (handle: Handler) => void,
    deactivate: () => void
  ) {
    super({
      fills: '#ff0000',
      w: cpSize,
      h: cpSize,
      selectable: false,
    });
    this.deactivate = deactivate;
    this.activate = activate;
    this.handleConfig = handleConfig;
    this.handleType = handleConfig.handleType;
    this.on('pointerenter', () => {
      activate(this);
    });
    // this.on('pointerleave', deactivate);
  }
  onPointerdown(context: Partial<IContext>) {
    this.handleConfig.onPointerdown?.(context);
  }
  onPointermove(context: IContext) {
    this.handleConfig.onPointermove?.(context);
  }
  onPointerup(context: Partial<IContext>) {
    this.handleConfig.onPointerup?.(context);
  }
}

/**
 * any transformation (scale/rotate/move) apply to Transformer will apply to selected primitives
 * @see {@link Transformer.applyTransform} to update selected primitives
 */
export class Transformer extends AbstractPrimitive {
  override readonly type = 'TRANSFORMER';
  private selectedPrimitives: AbstractPrimitive[] = [];
  private handleMap = {} as Record<HandleType, Handler>;
  private dragging = false;
  private lastInWorld: IPoint | null = null;
  private activeHandle: Handler | null = null;
  private overlay = new Rect({
    fills: 'rgba(0,0,255,0.1)',
    strokes: '#0000ff',
    selectable: false,
  });
  constructor() {
    super();
    // 确保事件可以触发
    this.eventMode = 'dynamic';
    this.interactive = true;
    this.addChild(this.overlay);
    // 创建控制点
    for (const handle of handles) {
      this.handleMap[handle.handleType] = new Handler(
        handle,
        this.activateHandler,
        this.deactivateHandler
      );
      this.addChild(this.handleMap[handle.handleType]);
    }

    this.update([]);

    this.on('pointerdown', this.onPointerdown);
    /**
     * 注意这里使用 globalpointermove 事件，而不是 pointermove，
     * 以确保在拖动过程中鼠标移出 Transformer 也能继续接收事件，获得更好的跟手效果
     * 原因是 pointermove 事件在鼠标移出元素时不会触发，而 globalpointermove 则会持续触发
     */
    this.on('globalpointermove', this.onGlobalpointermove);
    this.on('pointerup', this.onPointerup);
    this.on('pointerupoutside', this.onPointerup);
  }
  override isLeaf(): boolean {
    return false;
  }
  update(selected: AbstractPrimitive[]) {
    this.selectedPrimitives = selected;

    if (this.selectedPrimitives.length === 0) {
      this.visible = false;
      return;
    }
    this.visible = true;

    if (this.selectedPrimitives.length === 1) {
      // 单个图形时计算最小OBB（定向包围盒），去除skew影响
      const primitive = this.selectedPrimitives[0];

      // 计算primitive四个角点在transformer父坐标系中的位置
      const corners = [
        { x: 0, y: 0 },
        { x: primitive.w, y: 0 },
        { x: primitive.w, y: primitive.h },
        { x: 0, y: primitive.h },
      ];

      const transformerParent = this.parent!;
      const cornersInTransformerParent = corners.map((corner) => {
        // 先转到世界坐标系
        const worldPos = primitive.toGlobal(corner);
        // 再转到transformer父坐标系
        return transformerParent.toLocal(worldPos);
      });

      // 计算四个角点的中心
      const centerX =
        cornersInTransformerParent.reduce((sum, p) => sum + p.x, 0) / 4;
      const centerY =
        cornersInTransformerParent.reduce((sum, p) => sum + p.y, 0) / 4;

      // 使用primitive的旋转作为OBB的旋转方向
      // 计算primitive在transformer父坐标系中的旋转角度
      const primitiveWorldRotation = Math.atan2(
        primitive.worldTransform.b,
        primitive.worldTransform.a
      );
      const transformerParentRotation = Math.atan2(
        transformerParent.worldTransform.b,
        transformerParent.worldTransform.a
      );
      const rotation = primitiveWorldRotation - transformerParentRotation;

      // 将角点转换到以中心为原点、旋转后的局部坐标系
      const cos = Math.cos(-rotation);
      const sin = Math.sin(-rotation);
      const localCorners = cornersInTransformerParent.map((p) => {
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        return {
          x: dx * cos - dy * sin,
          y: dx * sin + dy * cos,
        };
      });

      // 计算在该旋转下的AABB
      const minX = Math.min(...localCorners.map((p) => p.x));
      const maxX = Math.max(...localCorners.map((p) => p.x));
      const minY = Math.min(...localCorners.map((p) => p.y));
      const maxY = Math.max(...localCorners.map((p) => p.y));

      const w = maxX - minX;
      const h = maxY - minY;

      // OBB的左上角在旋转坐标系中的位置
      const obbTopLeftX = minX;
      const obbTopLeftY = minY;

      // 将OBB左上角转回transformer父坐标系
      const finalTopLeftX =
        centerX +
        obbTopLeftX * Math.cos(rotation) -
        obbTopLeftY * Math.sin(rotation);
      const finalTopLeftY =
        centerY +
        obbTopLeftX * Math.sin(rotation) +
        obbTopLeftY * Math.cos(rotation);

      // 设置transformer（position是左上角）

      this.scale.set(1, 1);
      this.position.set(finalTopLeftX, finalTopLeftY);
      this.rotation = rotation;
      this.updateLocalTransform();

      this.updateAttr({ w, h });
      this.overlay.updateAttr({ w, h });
    } else {
      // 多个图形时使用AABB（轴对齐包围盒）
      const bounds = this.selectedPrimitives[0].getBounds().clone();
      bounds.applyMatrix(this.parent!.worldTransform.clone().invert());

      const x = bounds.minX;
      const y = bounds.minY;
      const w = bounds.maxX - bounds.minX;
      const h = bounds.maxY - bounds.minY;
      this.setFromMatrix(new Matrix());
      this.updateLocalTransform();
      this.updateAttr({
        x,
        y,
        w,
        h,
      });
      this.overlay.updateAttr({
        w,
        h,
      });
    }
  }

  getContext(currentInWorld: IPoint): IContext {
    const lastInWorld = this.lastInWorld!;
    const transformerParent = this.parent!;
    const currentInParent = transformerParent.toLocal(currentInWorld);
    const lastInParent = transformerParent.toLocal(lastInWorld);
    const lastInTransformer = this.toLocal(lastInWorld);
    const currentInTransformer = this.toLocal(currentInWorld);

    const bottomRightCorner = transformerParent.toLocal(
      {
        x: this.handleMap['bottom-right'].x,
        y: this.handleMap['bottom-right'].y,
      },
      this
    );

    return {
      transformer: this,
      boundingBoxInParent: new Bounds(
        this.x,
        this.y,
        bottomRightCorner.x,
        bottomRightCorner.y
      ),
      /**
       * why boundingBoxInTransformer is (0,0,w,h) ?
       * 1. in transformer's local coordinate system, its top-left corner is always (0,0)
       * 2. all trnasformations (scale/rotate/move) are applied to the transformer itself, so in transformer's local coordinate system, the bounding box is always (0,0,w,h).
       * so we can directly use (0,0,w,h) as boundingBoxInTransformer
       */
      boundingBoxInTransformer: new Bounds(0, 0, this.w, this.h),
      lastInWorld,
      lastInParent,
      lastInTransformer,
      currentInParent,
      currentInWorld,
      currentInTransformer,
      pivotInWorld: this.toGlobal({
        x: this.x + this.w / 2,
        y: this.y + this.h / 2,
      }),
      pivotInParent: transformerParent.toLocal(
        {
          x: this.w / 2,
          y: this.h / 2,
        },
        this
      ),
      updater: (deltaMatrix: Matrix) => {
        this.applyTransform(deltaMatrix);
      },
    };
  }

  override render(): void {
    for (const handle of handles) {
      const pos = handle.getPosition(this);
      const handleRect = this.handleMap[handle.handleType];
      handleRect.updateAttr({
        x: pos.x,
        y: pos.y,
      });
    }
  }
  onPointerdown = (event: FederatedPointerEvent) => {
    event.stopPropagation();
    this.dragging = true;
    this.lastInWorld = { x: event.global.x, y: event.global.y };
  };
  onGlobalpointermove = (e: FederatedPointerEvent) => {
    if (!this.dragging || !this.lastInWorld) return;

    /**
     * 为什么需要转换到父节点坐标系？
     * 因为 Transformer 可能会被缩放或旋转，直接使用全局坐标的差值会导致移动不准确。
     * 转换到父节点坐标系后，可以确保移动是基于父节点的坐标系进行计算的，从而保证了移动的准确性。
     */
    const transformerParent = this.parent;
    if (!transformerParent) return;
    const context = this.getContext({
      x: e.global.x,
      y: e.global.y,
    });
    console.log('handleType', this.activeHandle?.handleType);
    this.activeHandle?.onPointermove(context);

    this.lastInWorld = { x: e.global.x, y: e.global.y };
  };

  onPointerup = () => {
    this.dragging = false;
    this.lastInWorld = null;
  };

  applyTransform = (delta: Matrix) => {
    this.setFromMatrix(delta.clone().append(this.localTransform));
    this.updateLocalTransform();
    this.selectedPrimitives.forEach((primitive) => {
      const primitiveParentTransform = primitive.parent!.worldTransform.clone();
      const invertPrimitiveParentTransform = primitiveParentTransform
        .clone()
        .invert();
      const transformerParentTransform = this.parent!.worldTransform.clone();
      const invertTransformerParentTransform = transformerParentTransform
        .clone()
        .invert();

      const localDelta = invertPrimitiveParentTransform
        .append(transformerParentTransform)
        .append(delta)
        .append(invertTransformerParentTransform)
        .append(primitiveParentTransform);

      primitive.setFromMatrix(localDelta.append(primitive.localTransform));
      // BUG 为什么需要调用 updateLocalTransform？
      primitive.updateLocalTransform();
    });
  };

  activateHandler = (handler: Handler) => {
    this.activeHandle = handler;
  };
  deactivateHandler = () => {
    this.activeHandle = null;
  };
}
