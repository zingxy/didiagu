/**
 * @file spatial-index-manager.ts
 * @description 空间索引管理器，使用RBush实现对图元的空间索引管理
 * @author HongQing Zeng
 * @date 2025-12-04
 * @version 1.0.0
 */
import RBush from 'rbush';
import * as PIXI from 'pixi.js';
import { AbstractPrimitive } from './primitives/abstract-primitive';
import { SceneGraph } from './scene-graph';

/**
 * 扩展的Bounds类型，包含primitive的uuid
 */
interface IndexedBounds extends PIXI.Bounds {
  uuid: string;
  ref: AbstractPrimitive;
}

/**
 * 空间索引管理器
 * 负责维护图元的空间索引，支持快速的空间查询
 */
export class SpatialIndexManager {
  private spatialIndex = new RBush<IndexedBounds>();
  private primitiveToBounds = new WeakMap<AbstractPrimitive, IndexedBounds>();
  private sceneGraph: SceneGraph;

  constructor(sceneGraph: SceneGraph) {
    this.sceneGraph = sceneGraph;
  }
  private index(primitive: AbstractPrimitive) {
    const bounds = this.sceneGraph.getSceneBounds(primitive);
    const indexedBounds: IndexedBounds = Object.assign(bounds, {
      uuid: primitive.uuid,
      ref: primitive,
    });
    this.spatialIndex.insert(indexedBounds);
    this.primitiveToBounds.set(primitive, indexedBounds);
  }

  public track(primitive: AbstractPrimitive) {
    this.index(primitive);
    // 使用箭头函数绑定正确的上下文
    const onAttrChanged = () => {
      const oldIndexedBounds = this.primitiveToBounds.get(primitive);
      if (oldIndexedBounds) {
        this.spatialIndex.remove(oldIndexedBounds);
      }
      this.index(primitive);
    };

    const onRemoved = () => {
      const oldIndexedBounds = this.primitiveToBounds.get(primitive);
      if (oldIndexedBounds) {
        this.spatialIndex.remove(oldIndexedBounds);
        this.primitiveToBounds.delete(primitive);
      }
      primitive.off('attr.changed', onAttrChanged);
      primitive.off('removed', onRemoved);
      primitive.off('destroyed', onRemoved);
    };

    primitive.on('attr.changed', onAttrChanged);
    primitive.on('removed', onRemoved);
    primitive.on('destroyed', onRemoved);
  }
  search(bounds: PIXI.Bounds): IndexedBounds[] {
    const indexedBounds = this.spatialIndex.search(bounds);
    return indexedBounds;
  }
  all(): IndexedBounds[] {
    return this.spatialIndex.all();
  }
}
