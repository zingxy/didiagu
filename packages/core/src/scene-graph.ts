/**
 * @file scene-graph.ts
 * @description 场景树封装
 * @author HongQing Zeng
 * @date 2025-11-12
 * @version 1.0.0
 */

import { Matrix } from '@didiagu/math';
import { Editor } from './editor';
import * as PIXI from 'pixi.js';
import { AbstractPrimitive, Layer, LayerConfig } from './primitives';
import { SpatialIndexManager } from './spatial-index-manager';

export interface SceneGraphEvents {
  /** 场景树节点增加或删除 */
  'scene.descendantChanged': (children: AbstractPrimitive[]) => void;
}

export class SceneGraph {
  private bus: Editor['bus'];
  /**
   * 记录的是app.stage
   * 实际上不会对app.stage进行任何变换
   */
  private readonly root: PIXI.Container;
  /** 场景内容容器，会应用 camera 变换，业务应用的根容器，它的自接子元素是Layer */
  private readonly scene: PIXI.Container<Layer>;
  private readonly layerManager: LayerManager;
  private readonly spatialIndex = new SpatialIndexManager(this);
  private editor: Editor;
  /**
   * p_camera  = viewMatrix * p_world
   */
  private viewMatrix: Matrix = new Matrix();
  constructor(editor: Editor, root: PIXI.Container) {
    this.editor = editor;
    this.bus = editor.bus;
    this.root = root;
    // 创建独立的场景容器，用于应用 camera 变换
    this.scene = new PIXI.Container();
    this.root.addChild(this.scene);
    this.layerManager = new LayerManager(editor, this.scene);
    this.bindEvents();
  }
  bindEvents() {
    this.bus.on('camera.changed', this.onCameraChanged.bind(this));
  }
  onCameraChanged(matrix: Matrix) {
    // 应用变换到场景容器
    this.scene.setFromMatrix(matrix);
    this.viewMatrix = matrix;
    this.getPrimitivesInViewport();
  }
  /**
   * @description 获取图元在scene坐标系下的bounds
   * @param primitive
   * @returns
   */
  getBoundsInScene(primitive: AbstractPrimitive): PIXI.Bounds {
    return this.pixiWorldBoundsToSceneBounds(primitive.getBounds());
  }

  /**
   * @param worldbounds pixi.getBounds() 获取到的bounds
   * @returns 转换到 scene 坐标系下的bounds
   */
  pixiWorldBoundsToSceneBounds(worldbounds: PIXI.Bounds): PIXI.Bounds {
    const sceneBounds = worldbounds.clone();
    sceneBounds.applyMatrix(this.viewMatrix.clone().invert());
    return sceneBounds;
  }

  /**
   * @description 获取视口在scene坐标系下的bounds
   * @returns bounds
   */
  getViewportBoundsInScene(): PIXI.Bounds {
    const screen = this.editor.getScreen();
    const bounds = new PIXI.Bounds(
      screen.left,
      screen.top,
      screen.right,
      screen.bottom
    );
    return this.pixiWorldBoundsToSceneBounds(bounds);
  }
  /**
   * @description 获取在屏幕范围内的所有图元
   * @returns 图元列表
   */
  getPrimitivesInViewport() {
    const viewportBounds = this.getViewportBoundsInScene();
    const primitives = this.spatialIndex.search(viewportBounds);
    console.log('[debug] primitives in viewport:', primitives.length);
    console.log('[debug] primitives in rbush:', this.spatialIndex.all().length);
  }

  /**
   * 所有节点都应该添加到对应的图层中，或者图层的后代中
   */
  /** 添加子节点到默认图层 */
  addChild(layerId: 'default', ...children: PIXI.Container[]): PIXI.Container;
  /** 添加子节点到辅助图层 */
  addChild(layerId: 'helper', ...children: PIXI.Container[]): PIXI.Container;
  /** 添加子节点到指定图层 */
  addChild(layerId: string, ...children: PIXI.Container[]): PIXI.Container;
  /** 添加子节点到指定父容器 */
  addChild(parent: PIXI.Container, children: PIXI.Container[]): PIXI.Container;
  addChild(...args: unknown[]): PIXI.Container {
    if (typeof args[0] === 'string') {
      // 第一个参数是 layerId
      const layerId = args[0] as string;
      const children = args.slice(1) as PIXI.Container[];
      const layer = this.layerManager.getLayer(layerId);
      if (!layer) {
        throw new Error(`Layer "${layerId}" not found`);
      }
      if (layer.trackable) {
        this.bus.emit(
          'scene.descendantChanged',
          children as AbstractPrimitive[]
        );
        children.forEach((child) => {
          this.spatialIndex.track(child as AbstractPrimitive);
        });
      }
      return layer.addChild(...children);
    } else {
      // 第一个参数是父容器
      const parent = args[0] as PIXI.Container;
      const children = args[1] as PIXI.Container[];
      const layer = this.layerManager.findParentLayer(parent);
      if (!layer) {
        throw new Error(`Parent container is not inside any layer`);
      }
      if (layer.trackable) {
        this.bus.emit(
          'scene.descendantChanged',
          children as AbstractPrimitive[]
        );
        children.forEach((child) => {
          this.spatialIndex.track(child as AbstractPrimitive);
        });
      }
      return parent.addChild(...children);
    }
  }

  removeChildren = (...children: AbstractPrimitive[]) => {
    const removedChildren = [];
    for (const child of children) {
      const layer = this.layerManager.findParentLayer(child);
      if (layer && layer.trackable) {
        removedChildren.push(child);
      }
      child.parent?.removeChild(child);
    }
    this.bus.emit('scene.descendantChanged', removedChildren);
  };
  /**
   * @description 转换到场景坐标系
   * @param args
   * @returns
   */
  toLocal: PIXI.Container['toLocal'] = (...args) => {
    return this.scene.toLocal(...args);
  };
  getDefaultLayer(): Layer {
    return this.layerManager.getLayer('default')!;
  }
  traverse(
    root: AbstractPrimitive,
    callback: (node: AbstractPrimitive) => void
  ): void {
    callback(root);
    // base case
    if (root.isLeaf()) {
      return;
    }
    // make progress
    for (const child of root.children) {
      if (child instanceof AbstractPrimitive) {
        this.traverse(child, callback);
      }
    }
  }
  // 将layer trees转换成其它树
  map<T extends { children?: T[] }>(
    root: AbstractPrimitive,
    callback: (node: AbstractPrimitive) => T
  ): T {
    const newRoot = callback(root);
    // base case
    if (root.isLeaf()) {
      return newRoot;
    }
    // make progress
    // 非叶子节点，递归处理子节点
    const children = [] as T[];
    for (const child of root.children) {
      if (child instanceof AbstractPrimitive) {
        children.push(this.map(child, callback));
      } else {
        continue;
      }
    }
    newRoot.children = children;
    return newRoot;
  }
}

export interface LayerManagerEvents {
  /** 图层添加 */
  'layer.added': (layer: Layer) => void;
  /** 图层删除 */
  'layer.removed': (layer: Layer) => void;
  /** 图层属性变更 */
  'layer.changed': (layer: Layer) => void;
  /** 图层顺序变更 */
  'layer.reordered': (layers: Layer[]) => void;
  /** 当前激活图层变更 */
  'layer.activeChanged': (layer: Layer | null) => void;
}

export class LayerManager {
  private bus: Editor['bus'];
  private layers: Map<string, Layer> = new Map();
  private activeLayer: Layer | null = null;
  private root: PIXI.Container;

  constructor(editor: Editor, root: PIXI.Container) {
    this.bus = editor.bus;
    this.root = root;
    this.root.sortableChildren = true;

    // 创建默认图层
    this.createLayer({
      id: 'default',
      name: '默认图层',
      zIndex: 0,
      trackable: true,
    });
    // 创建辅助图层，辅助线、高亮框框等不需要记录历史的元素放在这里
    this.createLayer({
      id: 'helper',
      name: '辅助图层',
      zIndex: 9999,
      trackable: false,
    });
  }

  /**
   * 创建新图层
   */
  createLayer(config: LayerConfig): Layer {
    if (this.layers.has(config.id)) {
      throw new Error(`Layer with id "${config.id}" already exists`);
    }

    const layer = new Layer(config);
    this.layers.set(config.id, layer);
    this.root.addChild(layer);

    // 如果是第一个图层，设为激活图层
    if (!this.activeLayer) {
      this.setActiveLayer(layer.id);
    }

    this.bus.emit('layer.added', layer);
    return layer;
  }
  findParentLayer(container: PIXI.Container): Layer | null {
    let current: PIXI.Container | null = container;
    while (current) {
      for (const layer of this.layers.values()) {
        if (layer === current) {
          return layer;
        }
      }
      current = current.parent;
    }
    return null;
  }

  /**
   * 删除图层
   */
  removeLayer(id: string): boolean {
    const layer = this.layers.get(id);
    if (!layer) return false;

    // 不允许删除默认图层
    if (id === 'default') {
      throw new Error('Cannot remove default layer');
    }

    // 如果删除的是激活图层，切换到默认图层
    if (this.activeLayer?.id === id) {
      this.setActiveLayer('default');
    }

    this.root.removeChild(layer);
    this.layers.delete(id);
    this.bus.emit('layer.removed', layer);

    return true;
  }

  /**
   * 获取图层
   */
  getLayer(id: string, fallback = false): Layer | undefined {
    const layer = this.layers.get(id);
    if (!layer && fallback) {
      return this.layers.get('default');
    }
    return layer;
  }

  /**
   * 获取所有图层（按 zIndex 排序）
   */
  getLayers(): Layer[] {
    return Array.from(this.layers.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  /**
   * 设置激活图层
   */
  setActiveLayer(id: string): boolean {
    const layer = this.layers.get(id);
    if (!layer) return false;

    this.activeLayer = layer;
    this.bus.emit('layer.activeChanged', layer);
    return true;
  }

  /**
   * 获取激活图层
   */
  getActiveLayer(): Layer | null {
    return this.activeLayer;
  }

  /**
   * 更新图层属性
   */
  updateLayer(id: string, config: Partial<Omit<LayerConfig, 'id'>>): boolean {
    const layer = this.layers.get(id);
    if (!layer) return false;

    if (config.name !== undefined) layer.name = config.name;
    if (config.visible !== undefined) layer.visible = config.visible;
    if (config.locked !== undefined) layer.locked = config.locked;
    if (config.zIndex !== undefined) {
      layer.zIndex = config.zIndex;
      this.root.sortChildren();
      this.bus.emit('layer.reordered', this.getLayers());
    }

    this.bus.emit('layer.changed', layer);
    return true;
  }

  /**
   * 添加元素到激活图层
   */
  addToActiveLayer(...children: PIXI.Container[]): boolean {
    if (!this.activeLayer) return false;
    this.activeLayer.addChild(...children);
    return true;
  }

  /**
   * 移动图层顺序
   */
  moveLayer(id: string, targetZIndex: number): boolean {
    const layer = this.layers.get(id);
    if (!layer) return false;

    layer.zIndex = targetZIndex;
    this.root.sortChildren();
    this.bus.emit('layer.reordered', this.getLayers());
    return true;
  }

  /**
   * 显示/隐藏图层
   */
  toggleLayerVisibility(id: string): boolean {
    const layer = this.layers.get(id);
    if (!layer) return false;

    layer.visible = !layer.visible;
    this.bus.emit('layer.changed', layer);
    return true;
  }

  /**
   * 锁定/解锁图层
   */
  toggleLayerLock(id: string): boolean {
    const layer = this.layers.get(id);
    if (!layer) return false;

    layer.locked = !layer.locked;
    this.bus.emit('layer.changed', layer);
    return true;
  }

  /**
   * 清空图层内容
   */
  clearLayer(id: string): boolean {
    const layer = this.layers.get(id);
    if (!layer) return false;

    layer.removeChildren();
    this.bus.emit('layer.changed', layer);
    return true;
  }

  /**
   * 销毁所有图层
   */
  destroy(): void {
    this.layers.forEach((layer) => {
      this.root.removeChild(layer);
      layer.destroy({ children: true });
    });
    this.layers.clear();
    this.activeLayer = null;
  }
}
