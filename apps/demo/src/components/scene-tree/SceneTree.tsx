import { useAppState } from '@/store';
import { Tree } from 'antd';
import { useEffect, useReducer } from 'react';
import { PrimitiveType } from '@didiagu/core';
import { FrameToolIcon, RectToolIcon } from '@icons';

const SHAPE_MAP: Record<PrimitiveType, { icon: React.ReactNode }> = {
  RECTANGLE: {
    icon: <RectToolIcon />,
  },
  FRAME: {
    icon: <FrameToolIcon />,
  },
  ELLIPSE: {
    icon: <RectToolIcon />,
  },
};

export default function SceneTree() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const editor = useAppState((state) => state.editor);
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

  const treeData = editor?.sceneGraph.stage.children.map((c) => {
    return {
      key: c.uuid,
      title: c.type,
      children: [],
      icon: SHAPE_MAP[c.type].icon,
    };
  });
  return <Tree showIcon treeData={treeData} />;
}
