import { useAppState } from '@/store';
import { Switch, Tree, type TreeDataNode } from 'antd';
import { useEffect, useReducer, useState } from 'react';
import { AbstractPrimitive, type PrimitiveType } from '@didiagu/core';
import { FrameToolIcon, RectToolIcon } from '@icons';
import { DownOutlined } from '@ant-design/icons';
import clsx from 'clsx';

const SHAPE_MAP: Record<PrimitiveType, { icon: React.ReactNode }> = {
  Rect: {
    icon: (
      <span className="w-full h-full flex justify-center items-center">
        <RectToolIcon />
      </span>
    ),
  },
  Frame: {
    icon: (
      <span className="w-full h-full flex justify-center items-center">
        <FrameToolIcon />
      </span>
    ),
  },
  Ellipse: {
    icon: (
      <span className="w-full h-full flex justify-center items-center">
        <RectToolIcon />
      </span>
    ),
  },
  Layer: {
    icon: (
      <span className="w-full h-full flex justify-center items-center">
        <RectToolIcon />
      </span>
    ),
  },
  Picture: {
    icon: (
      <span className="w-full h-full flex justify-center items-center">
        <RectToolIcon />
      </span>
    ),
  },
  Transformer: {
    icon: (
      <span className="w-full h-full flex justify-center items-center">
        <RectToolIcon />
      </span>
    ),
  },
};

export default function SceneTree() {
  const [showTree, setShowTree] = useState(true);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const editor = useAppState((state) => state.editor);
  const selection = useAppState((state) => state.selection);
  const selectedKeys = selection.map((item) => item.uuid);
  useEffect(() => {
    if (!editor) return;
    const onDescendantChanged = () => {
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
    title: 'root',
    children: data ? data.children : [],
  };

  return (
    <div
      className={clsx(
        'fixed left-4 top-4 bg-white w-50 rounded-xl shadow h-8 min-h-12',
        {
          'h-9/10': showTree,
          'flex flex-col justify-center': !showTree,
        }
      )}
    >
      <div className="flex justify-around w-full items-center gap-4 p-2">
        <span>Scene</span>
        <Switch size="small" checked={showTree} onChange={setShowTree} />
      </div>
      {showTree && (
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
      )}
    </div>
  );
}
