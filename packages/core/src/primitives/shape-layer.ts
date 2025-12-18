import { AbstractPrimitiveView } from './abstract-primitive';
import { PrimitiveMap } from './primitive';

export interface LayerConfig {
  /** 图层 ID */
  id: string;
  /** 图层名称 */
  name: string;
  /** 是否可见 */
  visible?: boolean;
  /** 是否锁定（不可编辑） */
  locked?: boolean;
  /** z-index，用于排序 */
  zIndex?: number;
  /** 是否可记录历史 */
  trackable?: boolean;
}
/**
 * 图层类,逻辑层，不作为渲染节点
 */
export class Layer extends AbstractPrimitiveView {
  public id: string;
  public name: string;
  public locked: boolean = false;
  public trackable: boolean = true;
  readonly type = PrimitiveMap.Layer;
  constructor(config: LayerConfig) {
    super();
    this.id = config.id;
    this.name = config.name;
    this.visible = config.visible ?? true;
    this.locked = config.locked ?? false;
    this.zIndex = config.zIndex ?? 0;
    this.sortableChildren = true;
    this.trackable = config.trackable ?? true;
  }
  override draw(): void {
    // 图层不需要渲染
  }
  override isLeaf(): boolean {
    return false;
  }
}
