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
  TopoGraphIcon,
  PictureToolIcon,
} from '@icons';
import { useEffect } from 'react';

import { Popover, Upload } from 'antd';

import clsx from 'clsx';
import type { ToolType } from '@didiagu/core';
import { useAppState } from '@/store';

interface ToolbarIconProps {
  selected?: boolean;
  name: string;
  tool: ToolConfig;
  onClick: (...args: unknown[]) => void;
}

const ToolItem: React.FC<React.PropsWithChildren<ToolbarIconProps>> = ({
  children,
  selected,
  name,
  tool,
  onClick,
}) => {
  const classnames = clsx(
    'text-3xl cursor-pointer  rounded-md p-1 inline-block',
    {
      'text-white': selected,
      'bg-blue-500': selected,
      'hover:bg-slate-100': !selected,
    }
  );
  return (
    <Popover trigger="hover" content={name}>
      {tool.trigger === 'upload' ? (
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={async (file) => {
            console.log('file', file);
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              onClick?.(result);
            };
            reader.readAsDataURL(file);
            return false; // 阻止自动上传
          }}
        >
          <span className={classnames}>{children}</span>
        </Upload>
      ) : (
        <span
          className={classnames}
          onClick={tool.trigger ? undefined : onClick}
        >
          {children}
        </span>
      )}
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

interface ToolConfig {
  icon: React.ReactNode;
  name: ToolType | string;
  trigger?: 'click' | 'upload';
}

const tools: ToolConfig[] = [
  { icon: <SelectToolIcon />, name: 'SELECT' },
  { icon: <FrameToolIcon />, name: 'FRAME' },
  { icon: <RectToolIcon />, name: 'RECTANGLE' },
  { icon: <PenToolIcon />, name: 'Pen' },
  { icon: <TextToolIcon />, name: 'Text' },
  { icon: <TopoGraphIcon />, name: 'Graph' },
  { icon: <PictureToolIcon />, name: 'PICTURE', trigger: 'upload' },
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
          <ToolItem
            selected={currentToolId === tool.name}
            key={tool.name}
            name={tool.name}
            onClick={(...args) => editor?.setCurrentTool(tool.name, ...args)}
            tool={tool}
          >
            {tool.icon}
          </ToolItem>
        );
      })}
    </div>
  );
};

const Toolbar: React.FC = () => {
  return (
    <div className="toolbar fixed w-screen top-4 flex justify-center pointer-events-none">
      <div className="min-w-1/4 h-12 rounded-xl shadow bg-white flex items-stretch pointer-events-auto">
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
