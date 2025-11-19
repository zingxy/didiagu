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
};

export default function SceneTree() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const editor = useAppState((state) => state.editor);
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

  const data = editor ? editor.sceneGraph.getSceneTreeRoot().children.map(dfs) : [];
  console.log('scene tree data', data);
  const root = {
    key: 'root',
    title: 'Scene',
    children: data,
  };
  return (
    <Tree
      showIcon
      showLine
      defaultExpandAll
      defaultExpandParent
      defaultExpandedKeys={['root']}
      autoExpandParent
      treeData={[root]}
      switcherIcon={<DownOutlined />}
    />
  );
}

function dfs(root: AbstractPrimitive): TreeDataNode {
  switch (root.type) {
    case 'RECTANGLE':
    case 'ELLIPSE':
      return {
        icon: SHAPE_MAP[root.type].icon,
        key: root.uuid,
        title: root.type,
        children: [],
      };
    case 'FRAME':
      return {
        icon: SHAPE_MAP[root.type].icon,
        key: root.uuid,
        title: root.type,
        children: root.children
          .filter((c) => c instanceof AbstractPrimitive)
          .map(dfs),
      };
    default:
      throw new Error(`Unknown primitive type: ${root.type}`);
  }
}
