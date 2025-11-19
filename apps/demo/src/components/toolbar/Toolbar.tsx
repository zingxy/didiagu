import * as React from 'react';
import {
  DesignModeIcon,
  DevModeIcon,
  FreeDrawModeIcon,
  FrameToolIcon,
  SelectToolIcon,
  RectToolIcon,
  PenToolIcon,
  TextToolIcon,
  ActionToolIcon,
  CommentToolIcon,
} from '@icons';
import { useEffect } from 'react';

import { Popover } from 'antd';

import clsx from 'clsx';
import type { ToolType } from '@didiagu/core';
import { useAppState } from '@/store';

interface ToolbarIconProps {
  selected?: boolean;
  name: string;
  onClick?: () => void;
}

const ToolbarToolIcon: React.FC<React.PropsWithChildren<ToolbarIconProps>> = ({
  children,
  selected,
  onClick,
  name,
}) => {
  const classnames = clsx('text-3xl cursor-pointer  rounded-md p-1', {
    'text-white': selected,
    'bg-blue-500': selected,
    'hover:bg-slate-100': !selected,
  });
  return (
    <Popover trigger="hover" content={name}>
      <span className={classnames} onClick={onClick}>
        {children}
      </span>
    </Popover>
  );
};

const ModeSwitcher: React.FC = () => {
  return (
    <div className="flex justify-between items-center items-center bg-slate-100 p-1 rounded-md">
      <span className="text-3xl">
        <FreeDrawModeIcon />
      </span>
      <span className="bg-amber-50 text-blue-500 cursor-pointer shadow-md rounded text-3xl">
        <DesignModeIcon />
      </span>
      <span className="text-3xl">
        <DevModeIcon />
      </span>
    </div>
  );
};

interface ToolbarConfig {
  icon: React.ReactNode;
  name: ToolType | string;
}

const tools: ToolbarConfig[] = [
  { icon: <SelectToolIcon />, name: 'SELECT' },
  { icon: <FrameToolIcon />, name: 'FRAME' },
  { icon: <RectToolIcon />, name: 'RECTANGLE' },
  { icon: <PenToolIcon />, name: 'Pen' },
  { icon: <TextToolIcon />, name: 'Text' },
  { icon: <CommentToolIcon />, name: 'Comment' },
  { icon: <ActionToolIcon />, name: 'ELLIPSE' },
];

const ToolSelector: React.FC = () => {
  const { currentToolId, editor, setCurrentToolId } = useAppState();

  useEffect(() => {
    const handleToolChange = (toolId: string) => {
      setCurrentToolId(toolId);
    };
    editor?.on('tool.changed', handleToolChange);
    return () => {
      editor?.off('tool.changed', handleToolChange);
    };
  }, [editor, setCurrentToolId]);

  return (
    <div className="flex-1 flex justify-between items-center items-center p-1 rounded-md">
      {tools.map((tool) => {
        return (
          <ToolbarToolIcon
            selected={currentToolId === tool.name}
            key={tool.name}
            name={tool.name}
            onClick={() => editor?.setCurrentTool(tool.name)}
          >
            {tool.icon}
          </ToolbarToolIcon>
        );
      })}
    </div>
  );
};

const Toolbar: React.FC = () => {
  return (
    <div className="toolbar fixed w-screen bottom-2 flex justify-center">
      <div className="w-1/4 h-12 rounded-xl shadow bg-white flex items-stretch">
        <div className="left flex-7 flex items-center justify-center">
          <ToolSelector />
        </div>
        <div className="right flex-2 flex items-center justify-center border-l">
          <ModeSwitcher />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
