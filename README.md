# didiagu

图形编辑器

## Core modules
- [x] SceneGraph
- [x] Camera
- [x] ToolManager
    - [X] shape tool
    - [ ] select tool
    - [ ] image tool
    - [ ] graph tool
    - [ ] Curve tool 
    - [ ] Text tool
- [x] Layers
- [x] Selection
- [x] Transformer
- [ ] History
- [x] ActionManager(Shortcuts) 
- [ ] Ruler
- [ ] Grid
- [ ] Alignment/Snap
- [ ] Clipboard
- [ ] Collaboration

## 模块间通信

### 依赖注入

TODO

### 事件总线

主要用于状态更新通知

## 命名约定

- 文件 snake-case
- 常量全部大写 CONSTANT_VALUE
- 接口带前缀 I,IInterface
