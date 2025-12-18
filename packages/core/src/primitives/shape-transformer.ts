import {
  FederatedPointerEvent,
  Matrix,
  Bounds,
  Text,
  GraphicsContext,
  Cursor,
} from 'pixi.js';
import { AbstractPrimitiveView } from './abstract-primitive';
import { createEllipse, createTransformer, PrimitiveMap } from '..';
import { IPoint } from '../tool-manager';
import { decompose, decomposePixi, normalizeRect } from '@didiagu/math';
import { Editor, Ellipse } from '..';
import { throttle } from 'lodash';

interface IContext {
  lastInWorld: IPoint;
  lastInParent: IPoint;
  lastInTransformer: IPoint;

  currentInWorld: IPoint;
  currentInParent: IPoint;
  currentInTransformer: IPoint;

  centerInParent: IPoint;

  localBounds: Bounds;
  transformer: Transformer;
  /** the **delta** matrix which will apply to the transformer,
   * which means this is a matrix defined in transformers's parent coordinate system.
   * */
  updater: (deltaMatrix: Matrix) => void;
}
export interface IHandleConfig {
  handleType: HandleType;
  cursor?: Cursor;
  getPosition(transformer: AbstractPrimitiveView): { x: number; y: number };
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
      localBounds: { minX, minY, maxX, maxY },
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
  | 'mover'
  | (string & {});
const cpSize = 20;
export const defaultHandleConfigs: IHandleConfig[] = [
  {
    handleType: 'top-left',
    cursor: 'nwse-resize',
    getPosition() {
      return { x: -0, y: -0 };
    },
    onPointermove: createScaleHandler({
      getScaleX: (dx, w) => (w - dx) / w,
      getScaleY: (dy, h) => (h - dy) / h,
      getPivot: ({ maxX, maxY }) => ({ x: maxX, y: maxY }),
    }),
  },
  {
    handleType: 'top-middle',
    cursor: 'ns-resize',
    getPosition(primitive: AbstractPrimitiveView) {
      return { x: primitive.model.width / 2, y: 0 };
    },
    onPointermove: createScaleHandler({
      getScaleY: (dy, h) => (h - dy) / h,
      getPivot: ({ minX, maxX, maxY }) => ({ x: (minX + maxX) / 2, y: maxY }),
    }),
  },
  {
    handleType: 'top-right',
    cursor: 'nesw-resize',
    getPosition(primitive: AbstractPrimitiveView) {
      return { x: primitive.model.width, y: 0 };
    },
    onPointermove: createScaleHandler({
      getScaleX: (dx, w) => (w + dx) / w,
      getScaleY: (dy, h) => (h - dy) / h,
      getPivot: ({ minX, maxY }) => ({ x: minX, y: maxY }),
    }),
  },
  {
    handleType: 'middle-right',
    cursor: 'ew-resize',
    getPosition(primitive: AbstractPrimitiveView) {
      return { x: primitive.model.width, y: primitive.model.height / 2 };
    },
    onPointermove: createScaleHandler({
      getScaleX: (dx, w) => (w + dx) / w,
      getPivot: ({ minX, minY, maxY }) => ({ x: minX, y: (minY + maxY) / 2 }),
    }),
  },
  {
    handleType: 'bottom-right',
    cursor: 'nwse-resize',
    getPosition(primitive: AbstractPrimitiveView) {
      return { x: primitive.model.width, y: primitive.model.height };
    },
    onPointermove: createScaleHandler({
      getScaleX: (dx, w) => (w + dx) / w,
      getScaleY: (dy, h) => (h + dy) / h,
      getPivot: ({ minX, minY }) => ({ x: minX, y: minY }),
    }),
  },
  {
    handleType: 'bottom-middle',
    cursor: 'ns-resize',
    getPosition(primitive: AbstractPrimitiveView) {
      return { x: primitive.model.width / 2, y: primitive.model.height };
    },
    onPointermove: createScaleHandler({
      getScaleY: (dy, h) => (h + dy) / h,
      getPivot: ({ minX, minY, maxX }) => ({ x: (minX + maxX) / 2, y: minY }),
    }),
  },
  {
    handleType: 'bottom-left',
    cursor: 'nesw-resize',
    getPosition(primitive: AbstractPrimitiveView) {
      return { x: 0, y: primitive.model.height };
    },
    onPointermove: createScaleHandler({
      getScaleX: (dx, w) => (w - dx) / w,
      getScaleY: (dy, h) => (h + dy) / h,
      getPivot: ({ minY, maxX }) => ({ x: maxX, y: minY }),
    }),
  },
  {
    handleType: 'middle-left',
    cursor: 'ew-resize',
    getPosition(primitive: AbstractPrimitiveView) {
      return { x: 0, y: primitive.model.height / 2 };
    },
    onPointermove: createScaleHandler({
      getScaleX: (dx, w) => (w - dx) / w,
      getPivot: ({ minY, maxX, maxY }) => ({ x: maxX, y: (minY + maxY) / 2 }),
    }),
  },
  {
    handleType: 'rotate',
    cursor: 'grab',
    getPosition(primitive: AbstractPrimitiveView) {
      return { x: primitive.model.width / 2, y: -40 };
    },
    onPointermove(context) {
      const { centerInParent, currentInParent, lastInParent } = context;
      const v1 = {
        x: lastInParent.x - centerInParent.x,
        y: lastInParent.y - centerInParent.y,
      };
      const v2 = {
        x: currentInParent.x - centerInParent.x,
        y: currentInParent.y - centerInParent.y,
      };
      const angle1 = Math.atan2(v1.y, v1.x);
      const angle2 = Math.atan2(v2.y, v2.x);
      const deltaAngle = angle2 - angle1;

      const t = new Matrix().translate(centerInParent.x, centerInParent.y);
      const invertT = t.clone().invert();
      const r = new Matrix().rotate(deltaAngle);
      const deltaMatrix = t.append(r).append(invertT);
      context.updater(deltaMatrix);
    },
  },
  {
    handleType: 'mover',
    cursor: 'move',
    getPosition(primitive: AbstractPrimitiveView) {
      return { x: primitive.model.width / 2, y: primitive.model.height / 2 };
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
export class Handler extends Ellipse {
  handleType: string;
  handleConfig: IHandleConfig;
  deactivate: () => void;
  activate: (handle: Handler) => void;
  constructor(
    handleConfig: IHandleConfig,
    activate: (handle: Handler) => void,
    deactivate: () => void
  ) {
    super(
      createEllipse({
        fills: [{ type: 'SOLID', color: '#ff0000' }],
        width: cpSize,
        height: cpSize,
      })
    );
    this.cursor = handleConfig.cursor || 'pointer';
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
  buildPath(ctx: GraphicsContext): void {
    this.setFromMatrix(this.model.transform);
    ctx.circle(0, 0, cpSize / 2);
  }
}

/**
 * any transformation (scale/rotate/move) apply to Transformer will apply to selected primitives
 * @see {@link Transformer.applyTransform} to update selected primitives
 */
export class Transformer extends AbstractPrimitiveView {
  override readonly type = PrimitiveMap.Transformer;
  private selectedPrimitives: AbstractPrimitiveView[] = [];
  // handles pool
  private handles = new Set<Handler>();
  private dragging = false;
  private lastInWorld: IPoint | null = null;
  private activeHandle: Handler | null = null;
  private sizeGraphic: Text;
  private editor: Editor;
  constructor(editor: Editor) {
    super(
      createTransformer({
        fills: [],
        strokes: [{ type: 'SOLID', color: '#0000ff', strokeWidth: 1 }],
      })
    );
    this.editor = editor;
    this.sizeGraphic = new Text();
    this.addChild(this.sizeGraphic);
    this.on('pointerdown', this.onPointerdown);

    // FIXME
    /**
     * 1. 这里进行了节流处理，避免在拖动过程中频繁触发全局指针移动事件。
     */
    this.on('globalpointermove', throttle(this.onGlobalpointermove, 16));
    this.on('pointerup', this.onPointerup);
    this.on('pointerupoutside', this.onPointerup);
  }
  override isLeaf(): boolean {
    return false;
  }
  update(selected: AbstractPrimitiveView[]) {
    this.selectedPrimitives = selected;
    const handleConfigs: IHandleConfig[] = defaultHandleConfigs;
    if (this.selectedPrimitives.length === 0) {
      this.visible = false;
      return;
    }
    this.visible = true;

    if (this.selectedPrimitives.length === 1) {
      // 计算primitive四个角点在transformer父坐标系中的位置
      const primitive = this.selectedPrimitives[0];
      const corners = [
        { x: 0, y: 0 },
        { x: primitive.model.width, y: 0 },
        { x: primitive.model.width, y: primitive.model.height },
        { x: 0, y: primitive.model.height },
      ];
      console.log('corners:', corners);

      // 转换到transformer父坐标系
      const cornersInTransformerParent = corners.map((corner) => {
        return this.parent!.toLocal(primitive.toGlobal(corner));
      });

      const matrixInTransformerParent = this.parent!.worldTransform.clone()
        .invert()
        .append(primitive.worldTransform);

      // 计算旋转角度(绝对旋转)
      const rotation = decompose(matrixInTransformerParent).rotation;

      // 消除旋转的影响，计算AABB
      // TODO 为什么直接绕 transformer 父坐标系的原点旋转就可以了？ 因该绕图形中心旋转才对啊
      const r = new Matrix().rotate(-rotation);
      const rotatedCorners = cornersInTransformerParent.map((corner) => {
        return r.apply(corner);
      });
      const minX = Math.min(...rotatedCorners.map((corner) => corner.x));
      const maxX = Math.max(...rotatedCorners.map((corner) => corner.x));
      const minY = Math.min(...rotatedCorners.map((corner) => corner.y));
      const maxY = Math.max(...rotatedCorners.map((corner) => corner.y));
      // 计算出obb的宽高
      const width = maxX - minX;
      const height = maxY - minY;
      r.invert();
      // 计算出obb的左上角在transformer父坐标系中的位置
      // TODO 为什么直接计算出来的就是obb的左上角？
      const topLeft = r.apply({ x: minX, y: minY });
      this.updateAttrs({
        x: topLeft.x,
        y: topLeft.y,
        width,
        height,
        rotation: rotation,
      });
    } else {
      const primitives = this.selectedPrimitives;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const primitive of primitives) {
        const bounds = primitive.getBounds().clone();
        bounds.applyMatrix(this.parent!.worldTransform.clone().invert());
        minX = Math.min(minX, bounds.minX);
        minY = Math.min(minY, bounds.minY);
        maxX = Math.max(maxX, bounds.maxX);
        maxY = Math.max(maxY, bounds.maxY);
      }

      const x = minX;
      const y = minY;
      const w = maxX - minX;
      const h = maxY - minY;
      this.updateAttrs({
        x,
        y,
        width: w,
        height: h,
      });
    }
    const handlesArray = Array.from(this.handles.values());
    for (let i = 0; i < handleConfigs.length; i++) {
      const handleConfig = handleConfigs[i];
      const handle =
        handlesArray[i] ||
        new Handler(handleConfig, this.activateHandler, this.deactivateHandler);
      handle.handleConfig = handleConfig;
      handle.handleType = handleConfig.handleType;
      handle.visible = true;
      this.addChild(handle);
      this.handles.add(handle);
    }
  }

  getContext(currentInWorld: IPoint): IContext {
    const lastInWorld = this.lastInWorld!;
    const transformerParent = this.parent!;
    const currentInParent = transformerParent.toLocal(currentInWorld);
    const lastInParent = transformerParent.toLocal(lastInWorld);
    const lastInTransformer = this.toLocal(lastInWorld);
    const currentInTransformer = this.toLocal(currentInWorld);

    return {
      transformer: this,
      /**
       * why localBounds is (0,0,w,h) ?
       * 1. in transformer's local coordinate system, its top-left corner is always (0,0)
       * 2. all trnasformations (scale/rotate/move) are applied to the transformer itself, so in transformer's local coordinate system, the bounding box is always (0,0,w,h).
       * so we can directly use (0,0,w,h) as localBounds
       */
      localBounds: new Bounds(0, 0, this.model.width, this.model.height),
      lastInWorld,
      lastInParent,
      lastInTransformer,
      currentInParent,
      currentInWorld,
      currentInTransformer,
      centerInParent: transformerParent.toLocal(
        {
          x: this.model.width / 2,
          y: this.model.height / 2,
        },
        this
      ),
      updater: (deltaMatrix: Matrix) => {
        this.applyTransform(deltaMatrix);
      },
    };
  }

  override draw(): void {
    super.draw();
    this.updateHandlerPositions();
  }
  updateHandlerPositions() {
    this.handles.forEach((handle) => {
      if (!handle.visible) return;
      const pos = handle.handleConfig.getPosition(this);
      handle.updateAttrs({
        x: pos.x,
        y: pos.y,
      });
    });
  }

  onPointerdown = (event: FederatedPointerEvent) => {
    event.stopPropagation();
    this.dragging = true;
    this.lastInWorld = { x: event.global.x, y: event.global.y };
  };
  onGlobalpointermove = (e: FederatedPointerEvent) => {
    if (!this.dragging || !this.lastInWorld) return;

    const transformerParent = this.parent;
    if (!transformerParent) return;
    const context = this.getContext({
      x: e.global.x,
      y: e.global.y,
    });
    this.activeHandle?.onPointermove(context);

    this.lastInWorld = { x: e.global.x, y: e.global.y };
  };

  onPointerup = () => {
    this.dragging = false;
    this.lastInWorld = null;
  };
  apply(primitive: AbstractPrimitiveView, m: Matrix) {
    primitive.updateAttrs({
      transform: m.clone(),
    });
    // FIXME 使用下面的方法在移动过程中会导致图形和transformer不同步
    // 尤其是transformer带有strokes时更明显
    // const { x, y, rotation, skewX, skewY, scaleX, scaleY } = decomposePixi(m);
    // primitive.rotation = rotation;
    // primitive.skew.x = skewX;
    // primitive.skew.y = skewY;
    // primitive.scale.set(1, 1);
    // primitive.updateAttrs({
    //   ...normalizeRect(x, y, primitive.w * scaleX, primitive.h * scaleY),
    // }); // 触发重绘
  }

  applyTransform = (delta: Matrix) => {
    this.apply(this, delta.clone().append(this.localTransform));
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
      // 为什么要分离出scale? scale会影响stroke的宽度，导致变形
      const newMatrix = localDelta.append(primitive.localTransform);
      this.apply(primitive, newMatrix);
      // const { x, y, rotation, skewX, skewY, scaleX, scaleY } =
      //   decomposePixi(newMatrix);
      // primitive.rotation = rotation;
      // primitive.skew.x = skewX;
      // primitive.skew.y = skewY;
      // primitive.scale.set(1, 1);
      // primitive.updateAttrs({
      //   ...normalizeRect(x, y, primitive.w * scaleX, primitive.h * scaleY),
      // }); // 触发重绘
    });
  };

  activateHandler = (handler: Handler) => {
    this.activeHandle = handler;
  };
  deactivateHandler = () => {
    this.activeHandle = null;
  };
}
