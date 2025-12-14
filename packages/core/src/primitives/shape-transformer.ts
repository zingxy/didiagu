import { FederatedPointerEvent, Matrix, Bounds, Text } from 'pixi.js';
import { AbstractPrimitive, PrmitiveMap } from './abstract-primitive';
import { Rect } from './shape-rect';
import { IPoint } from '../tool-manager';
import { decompose, decomposePixi, normalizeRect } from '@didiagu/math';
import { Editor } from '..';

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
      fills: [{ type: 'SOLID', color: '#ff0000' }],
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
  override readonly type = PrmitiveMap.Transformer;
  private selectedPrimitives: AbstractPrimitive[] = [];
  private handleMap = {} as Record<HandleType, Handler>;
  private dragging = false;
  private lastInWorld: IPoint | null = null;
  private activeHandle: Handler | null = null;
  private overlay = new Rect({
    fills: [{ type: 'SOLID', color: 'rgba(0,0,255,0.1)' }],
    strokes: [{ type: 'SOLID', color: '#0000ff' }],
    selectable: false,
  });
  private sizeGraphic: Text;
  private editor: Editor;
  constructor(editor: Editor) {
    super();
    // 确保事件可以触发
    this.eventMode = 'dynamic';
    this.interactive = true;
    this.editor = editor;
    this.sizeGraphic = new Text();
    this.addChild(this.sizeGraphic);
    // this.addChild(this.overlay);
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
      // 计算primitive四个角点在transformer父坐标系中的位置
      const primitive = this.selectedPrimitives[0];
      const corners = [
        { x: 0, y: 0 },
        { x: primitive.w, y: 0 },
        { x: primitive.w, y: primitive.h },
        { x: 0, y: primitive.h },
      ];

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
      this.setFromMatrix(new Matrix());
      this.updateLocalTransform();
      this.updateAttrs({
        x: topLeft.x,
        y: topLeft.y,
        w: width,
        h: height,
        rotation: rotation,
      });
      this.overlay.updateAttrs({
        w: width,
        h: height,
      });
    } else {
      // 多个图形时使用AABB（轴对齐包围盒）
      const primitives = this.selectedPrimitives;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const primitive of primitives) {
        // FIXME 需要转换到transformer父坐标系, 现在刚好将transformer放在cameraSpace下，所以work
        const bounds = primitive.getBounds();
        minX = Math.min(minX, bounds.minX);
        minY = Math.min(minY, bounds.minY);
        maxX = Math.max(maxX, bounds.maxX);
        maxY = Math.max(maxY, bounds.maxY);
      }

      const x = minX;
      const y = minY;
      const w = maxX - minX;
      const h = maxY - minY;
      this.setFromMatrix(new Matrix());
      this.updateLocalTransform();
      this.updateAttrs({
        x,
        y,
        w,
        h,
      });
      this.overlay.updateAttrs({
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

    // 计算 transformer 四个角点在父级坐标系中的位置
    const topLeft = transformerParent.toLocal({ x: 0, y: 0 }, this);
    const bottomRight = transformerParent.toLocal(
      { x: this.w, y: this.h },
      this
    );

    return {
      transformer: this,
      boundingBoxInParent: new Bounds(
        topLeft.x,
        topLeft.y,
        bottomRight.x,
        bottomRight.y
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
        x: this.w / 2,
        y: this.h / 2,
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

  override draw(): void {
    this.updateHandlerPositions();
    this.updateSizeIndicator();
  }
  updateHandlerPositions() {
    for (const handle of handles) {
      const pos = handle.getPosition(this);
      const handleRect = this.handleMap[handle.handleType];
      handleRect.updateAttrs({
        x: pos.x,
        y: pos.y,
      });
    }
  }

  updateSizeIndicator() {
    const zoom = this.editor.camera.getZoom();
    this.sizeGraphic.text = `${Math.round(this.w / zoom)} x ${Math.round(
      this.h / zoom
    )}`;
    this.sizeGraphic.style.fontSize = 12;
    this.sizeGraphic.style.fontFamily = 'Arial';
    this.sizeGraphic.style.fontWeight = '400';
    this.sizeGraphic.style.fill = 0x000000;
    this.sizeGraphic.x = this.w / 2 - this.sizeGraphic.width / 2;
    this.sizeGraphic.y = this.h + cpSize;
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
  apply(primitive: AbstractPrimitive, m: Matrix) {
    // primitive.setFromMatrix(m);
    // primitive.updateLocalTransform();
    // return;
    // FIXME 使用下面的方法在移动过程中会导致图形和transformer不同步
    // 尤其是transformer带有strokes时更明显
    const { x, y, rotation, skewX, skewY, scaleX, scaleY } = decomposePixi(m);
    primitive.rotation = rotation;
    primitive.skew.x = skewX;
    primitive.skew.y = skewY;
    primitive.scale.set(1, 1);
    primitive.updateAttrs({
      ...normalizeRect(x, y, primitive.w * scaleX, primitive.h * scaleY),
    }); // 触发重绘
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
