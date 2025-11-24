import { useAppState } from '@/store';
import { Tree, type TreeDataNode } from 'antd';
import { useEffect, useReducer } from 'react';
import { AbstractPrimitive, type PrimitiveType } from '@didiagu/core';
import { FrameToolIcon, RectToolIcon } from '@icons';
import { DownOutlined } from '@ant-design/icons';

const SHAPE_MAP: Record<PrimitiveType, { icon: React.ReactNode }> = {
  RECTANGLE: {
    icon: (
      <span className="w-full h-full flex justify-center items-center">
        <RectToolIcon />
      </span>
    ),
  },
  FRAME: {
    icon: (
      <span className="w-full h-full flex justify-center items-center">
        <FrameToolIcon />
      </span>
    ),
  },
  ELLIPSE: {
    icon: (
      <span className="w-full h-full flex justify-center items-center">
        <RectToolIcon />
      </span>
    ),
  },
  LAYER: {
    icon: (
      <span className="w-full h-full flex justify-center items-center">
        <RectToolIcon />
      </span>
    ),
  },
};

export default function SceneTree() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const editor = useAppState((state) => state.editor);
  const selection = useAppState((state) => state.selection);
  const selectedKeys = selection.map((item) => item.uuid);
  console.log('SceneTree render', selectedKeys);
  useEffect(() => {
    if (!editor) return;
    const onDescendantChanged = (children: AbstractPrimitive[]) => {
      console.log('descendant changed', children);
      forceUpdate();
    };
    editor.on('scene.descendantChanged', onDescendantChanged);
    return () => {
      editor.off('scene.descendantChanged', onDescendantChanged);
    };
  }, [editor]);

  const expandKeys = ['root'];
  const data = editor?.sceneGraph.map<TreeDataNode>(
    editor.sceneGraph.getDefaultLayer(),
    (node) => {
      expandKeys.push(node.uuid);
      return {
        icon: SHAPE_MAP[node.type].icon,
        key: node.uuid,
        title: node.type,
        isLeaf: node.isLeaf(),
        // children: [], // 会被 map 方法自动填充
      };
    }
  );

  const root: TreeDataNode = {
    key: 'root',
    title: 'Scene',
    children: data ? data.children : [],
  };
  console.log('tree data', root);

  return (
    <Tree
      multiple
      showIcon
      showLine
      defaultExpandAll
      defaultExpandParent
      defaultExpandedKeys={['root']}
      autoExpandParent
      expandedKeys={expandKeys}
      treeData={[root]}
      switcherIcon={<DownOutlined />}
      selectedKeys={selectedKeys}
    />
  );
}
