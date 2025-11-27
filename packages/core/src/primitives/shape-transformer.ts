import { FederatedPointerEvent, Matrix, Bounds } from 'pixi.js';
import { AbstractPrimitive } from './abstract-primitive';
import { Rect } from './shape-rect';
import { IPoint } from '../tool-manager';

interface IContext {
  lastWorld: IPoint;
  lastLocal: IPoint;
  currentWorld: IPoint;
  currentLocal: IPoint;
  pviotWorld: IPoint;
  pivotLocal: IPoint;
  boundingBox: Bounds;
  updater: (deltaMatrix: Matrix) => void;
}
interface IHandleConfig {
  handleType: HandleType;
  getPosition(primitive: AbstractPrimitive): { x: number; y: number };
  onPointerdown?(context: Partial<IContext>): void;
  onPointermove?(context: IContext): void;
  onPointerup?(context: Partial<IContext>): void;
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
    onPointermove(context) {
      const {
        lastLocal,
        currentLocal,
        boundingBox: { minY, minX, maxX, maxY },
      } = context;
      const dx = currentLocal.x - lastLocal.x;
      const dy = currentLocal.y - lastLocal.y;
      const w = maxX - minX;
      const h = maxY - minY;
      const scaleX = (w - dx) / w;
      const scaleY = (h - dy) / h;

      const pivot = { x: maxX, y: maxY };

      const t = new Matrix().translate(pivot.x, pivot.y);
      const invertT = t.clone().invert();
      const s = new Matrix().scale(scaleX, scaleY);
      const deltaMatrix = t.append(s).append(invertT);
      context.updater(deltaMatrix);
    },
  },
  {
    handleType: 'top-middle',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w / 2 - offset, y: -offset };
    },
  },
  {
    handleType: 'top-right',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w - offset, y: -offset };
    },
  },
  {
    handleType: 'middle-right',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w - offset, y: primitive.h / 2 - offset };
    },
  },
  {
    handleType: 'bottom-right',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w, y: primitive.h };
    },
  },
  {
    handleType: 'bottom-middle',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w / 2 - offset, y: primitive.h - offset };
    },
  },
  {
    handleType: 'bottom-left',
    getPosition(primitive: AbstractPrimitive) {
      return { x: -offset, y: primitive.h - offset };
    },
  },
  {
    handleType: 'middle-left',
    getPosition(primitive: AbstractPrimitive) {
      return { x: -offset, y: primitive.h / 2 - offset };
    },
  },
  {
    handleType: 'rotate',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w / 2 - offset, y: -40 - offset };
    },
    onPointermove(context) {
      const { pivotLocal, currentLocal, lastLocal } = context;
      const v1 = {
        x: lastLocal.x - pivotLocal.x,
        y: lastLocal.y - pivotLocal.y,
      };
      const v2 = {
        x: currentLocal.x - pivotLocal.x,
        y: currentLocal.y - pivotLocal.y,
      };
      const angle1 = Math.atan2(v1.y, v1.x);
      const angle2 = Math.atan2(v2.y, v2.x);
      const deltaAngle = angle2 - angle1;

      const t = new Matrix().translate(pivotLocal.x, pivotLocal.y);
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
      const { lastLocal, currentLocal } = context;
      const dx = currentLocal.x - lastLocal.x;
      const dy = currentLocal.y - lastLocal.y;
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

export class Transformer extends AbstractPrimitive {
  override readonly type = 'TRANSFORMER';
  private selectedPrimitives: AbstractPrimitive[] = [];
  private handleMap = {} as Record<HandleType, Handler>;
  private dragging = false;
  private lastWorld: IPoint | null = null;
  private activeHandle: Handler | null = null;

  constructor() {
    super();
    // 确保事件可以触发
    this.eventMode = 'dynamic';
    this.interactive = true;

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

    const first = this.selectedPrimitives[0];
    this.updateAttr({
      x: first.x,
      y: first.y,
      w: first.w,
      h: first.h,
      scaleX: first.scaleX,
      scaleY: first.scaleY,

      rotation: first.rotation,
    });
  }

  getContext(currentWorld: IPoint): IContext {
    const lastWorld = this.lastWorld!;
    const transformerParent = this.parent!;
    const currentLocal = transformerParent.toLocal(currentWorld);
    const lastLocal = transformerParent.toLocal(lastWorld);

    const bottomRightCorner = transformerParent.toLocal(
      {
        x: this.handleMap['bottom-right'].x,
        y: this.handleMap['bottom-right'].y,
      },
      this
    );
    return {
      boundingBox: new Bounds(
        this.x,
        this.y,
        bottomRightCorner.x,
        bottomRightCorner.y
      ),
      lastWorld,
      currentLocal,
      lastLocal,
      currentWorld,
      pviotWorld: this.toGlobal({
        x: this.x + this.w / 2,
        y: this.y + this.h / 2,
      }),
      pivotLocal: transformerParent.toLocal(
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
    this.lastWorld = { x: event.global.x, y: event.global.y };
  };
  onGlobalpointermove = (e: FederatedPointerEvent) => {
    if (!this.dragging || !this.lastWorld) return;

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

    this.lastWorld = { x: e.global.x, y: e.global.y };
  };

  onPointerup = () => {
    this.dragging = false;
    this.lastWorld = null;
  };

  applyTransform(delta: Matrix) {
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
  }

  activateHandler = (handler: Handler) => {
    this.activeHandle = handler;
  };
  deactivateHandler = () => {
    this.activeHandle = null;
  };
}
