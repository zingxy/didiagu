/**
 * @file event-bus.ts
 * @description 定义事件总线，事件类型在各个模块中定义，在这里进行汇总。
 * 事件命名采用<模块名>.<事件名>的形式，确保全局唯一。
 * @author HongQing Zeng
 * @date 2025-11-12
 * @version 1.0.0
 */

import EventEmitter from 'eventemitter3';
import { CameraEvents } from './camera';
import { EditorEvents } from './editor';
import { ToolManagerEvents } from './tool-manager/tool-manager';
import { SceneGraphEvents } from './scene-graph';

type AnyEvent = {
  // copy from pixijs
  // https://stackoverflow.com/questions/70144348/why-does-a-union-of-type-literals-and-string-cause-ide-code-completion-wh
  // eslint-disable-next-line
  [K: ({} & string) | ({} & symbol)]: any;
};
type DidiaguEvents = AnyEvent &
  CameraEvents &
  EditorEvents &
  ToolManagerEvents &
  SceneGraphEvents;

export class EventBus extends EventEmitter<DidiaguEvents> {
  constructor() {
    super();
  }
}

export const bus = new EventBus();
