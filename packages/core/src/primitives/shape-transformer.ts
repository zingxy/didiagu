import { AbstractPrimitive } from './abstract-primitive';
import { Rect } from './shape-rect';

interface IHandle {
  type: string;
  getPosition(primitive: AbstractPrimitive): { x: number; y: number };
}

const cpSize = 20;
const offset = cpSize / 2;
const handles: IHandle[] = [
  {
    type: 'top-left',
    getPosition() {
      return { x: -offset, y: -offset };
    },
  },
  {
    type: 'top-middle',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w / 2 - offset, y: -offset };
    },
  },
  {
    type: 'top-right',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w - offset, y: -offset };
    },
  },
  {
    type: 'middle-right',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w - offset, y: primitive.h / 2 - offset };
    },
  },
  {
    type: 'bottom-right',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w - offset, y: primitive.h - offset };
    },
  },
  {
    type: 'bottom-middle',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w / 2 - offset, y: primitive.h - offset };
    },
  },
  {
    type: 'bottom-left',
    getPosition(primitive: AbstractPrimitive) {
      return { x: -offset, y: primitive.h - offset };
    },
  },
  {
    type: 'middle-left',
    getPosition(primitive: AbstractPrimitive) {
      return { x: -offset, y: primitive.h / 2 - offset };
    },
  },
  {
    type: 'rotate',
    getPosition(primitive: AbstractPrimitive) {
      return { x: primitive.w / 2 - offset, y: -40 - offset };
    },
  },
];

export class Transformer extends AbstractPrimitive {
  override readonly type = 'TRANSFORMER';
  private selectedPrimitives: AbstractPrimitive[] = [];
  private handleMap: Record<string, Rect> = {};
  constructor() {
    super();
    // 创建控制点
    for (const handle of handles) {
      const cp = new Rect({
        fills: '#ff0000',
        w: cpSize,
        h: cpSize,
        selectable: false,
      });
      this.handleMap[handle.type] = cp;
      this.addChild(cp);
    }
    this.update([]);
  }
  isLeaf(): boolean {
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
    });
  }

  override render(): void {
    this.graphics.clear();
    this.graphics
      .rect(0, 0, this.w, this.h)
      .stroke({ color: '#00ff00', width: 2 });
    // 更新handle位置
    for (const handle of handles) {
      const cp = this.handleMap[handle.type];
      const pos = handle.getPosition(this);
      console.log('pos', pos);
      cp.updateAttr({
        x: pos.x,
        y: pos.y,
      });
    }
  }
}
