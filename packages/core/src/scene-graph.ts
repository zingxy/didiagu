/**
 * @file scene-graph.ts
 * @description 场景树封装
 * @author HongQing Zeng
 * @date 2025-11-12
 * @version 1.0.0
 */

import { isIntersect, Matrix } from '@didiagu/math';
import { Editor } from './editor';
import * as PIXI from 'pixi.js';
import { AbstractPrimitive } from './primitives';
import { SpatialIndexManager } from './spatial-index-manager';
import { Text } from './primitives/shape-text';

export interface SceneGraphEvents {
  /** 场景树节点增加或删除 */
  'scene.descendantChanged': (children: AbstractPrimitive[]) => void;
}

export class SceneGraph {
  private bus: Editor['bus'];
  /**
   * @description 这里是cameraSpace/Viewport
   */
  private readonly cameraSpace: PIXI.Container;
  /**
   * p_camera  = viewMatrix * p_world
   */
  private viewMatrix: Matrix = new Matrix(); // 感觉可以废弃，直接用
  /**
   * @description **逻辑**世界空间，区别于pixijs的world
   */
  private readonly scene: PIXI.Container;
  /**
   * @description 空间索引
   */
  private readonly spatialIndex = new SpatialIndexManager(this);
  /**
   * @description 图元映射表，通过id快速定位图元
   */
  private readonly primitiveMap: Map<string, AbstractPrimitive> = new Map();
  private editor: Editor;
  /**图形层 */
  public doc: PIXI.Container<AbstractPrimitive>;
  /**辅助层 */
  public helperLayer: PIXI.Container;
  constructor(editor: Editor, root: PIXI.Container) {
    this.editor = editor;
    this.bus = editor.bus;
    this.cameraSpace = root;
    // 创建独立的场景容器，用于应用 camera 变换
    this.scene = new PIXI.Container();
    this.cameraSpace.addChild(this.scene);

    this.doc = new PIXI.Container();
    this.helperLayer = new PIXI.Container();
    this.scene.addChild(this.doc);
    this.scene.addChild(this.helperLayer);
    this.bindEvents();
  }
  bindEvents() {
    this.bus.on('camera.changed', this.onCameraChanged.bind(this));
  }
  onCameraChanged(matrix: Matrix) {
    // 应用变换到场景容器, **注意这里是直接设置scene的矩阵**
    this.scene.setFromMatrix(matrix);
    this.viewMatrix = matrix;

    // 更新所有文字对象的 resolution 以保持清晰度
    this.updateTextResolution(matrix);
  }

  /**
   * 根据 camera 缩放比例更新所有文字对象的分辨率
   * @param matrix 相机变换矩阵
   */
  private updateTextResolution(matrix: Matrix) {
    // 从变换矩阵中提取缩放比例
    const zoomScale = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);

    // 遍历所有图元，更新文字对象的 resolution
    this.primitiveMap.forEach((primitive) => {
      if (primitive instanceof Text) {
        primitive.updateResolution(zoomScale);
      }
    });
  }
  /**
   * @description 获取图元在scene坐标系下的bounds
   * @param primitive
   * @returns
   */
  getSceneBounds(primitive: AbstractPrimitive): PIXI.Bounds {
    return this.pixiWorldBoundsToSceneBounds(primitive.getBounds());
  }
  getSceneTransform(primitive: AbstractPrimitive): Matrix {
    const worldTransform = primitive.worldTransform;
    const sceneMatrix = this.viewMatrix.clone().invert().append(worldTransform);
    return sceneMatrix;
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
  getPrimitivesInViewport(): AbstractPrimitive[] {
    const viewportBounds = this.getViewportBoundsInScene();
    return this.getPrimiveByBounds(viewportBounds);
  }

  getPrimiveByBounds(bounds: PIXI.Bounds): AbstractPrimitive[] {
    const primitives: AbstractPrimitive[] = [];
    this.trverseDoc((node) => {
      const nodeBounds = this.getSceneBounds(node);
      if (isIntersect(bounds, nodeBounds)) {
        primitives.push(node);
      }
    });
    return primitives;
  }
  getPrimiveById(id: string): AbstractPrimitive | undefined {
    return this.primitiveMap.get(id);
  }
  /**
   * @description 转换到场景坐标系
   * @param args
   * @returns
   */
  toLocal: PIXI.Container['toLocal'] = (...args) => {
    return this.scene.toLocal(...args);
  };
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
  mapDoc<T extends { children?: T[] }>(
    callback: (node: AbstractPrimitive) => T
  ): T[] {
    return this.doc.children.map((child) => {
      return this.map(child, callback);
    });
  }
  trverseDoc(callback: (node: AbstractPrimitive) => void): void {
    this.doc.children.forEach((child) => {
      this.traverse(child, callback);
    });
  }
}
