import { useEffect, useRef } from 'react';
import { Editor } from '@didiagu/core';
import { Splitter } from 'antd';
import Toolbar from '@components/toolbar';
import { useAppState } from '@/store';
import SceneTree from '@components/scene-tree/SceneTree';
import Inspector from '@components/inspector/Inspector';
import { CommandPalette } from '@components/command-palette';
import { ContextMenu } from '@components/context-menu';
function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { editor, setEditor, setCurrentToolId } = useAppState((state) => state);

  useEffect(() => {
    // 如果已经有编辑器实例，直接返回

    let ignore = false;

    const newEditor = new Editor({
      width: containerRef.current?.clientWidth,
      height: containerRef.current?.clientHeight,
      background: '#f0f2f5',
      resizeTo: containerRef.current || undefined,
    });

    setEditor(newEditor);

    newEditor.on('editor.initialized', () => {
      const currentToolId = newEditor.getCurrentToolId();
      setCurrentToolId(currentToolId || null);
    });

    newEditor.init().then(() => {
      if (ignore) {
        newEditor.destroy();
        return;
      }

      // 只有在没有被取消的情况下才设置引用和添加到DOM
      if (
        containerRef.current &&
        !containerRef.current.contains(newEditor.app.canvas)
      ) {
        containerRef.current.appendChild(newEditor.app.canvas);
      }
    });

    return () => {
      ignore = true;
      editor?.destroy();
    };
  }, []);
  window.editor = editor;

  return (
    <>
      <Splitter className="h-screen" style={{ height: '100vh' }}>
        <Splitter.Panel min={200} max="30%" defaultSize={300} resizable>
          <SceneTree />
        </Splitter.Panel>
        <Splitter.Panel>
          <ContextMenu>
            <div ref={containerRef} className="w-full h-full" />
          </ContextMenu>
        </Splitter.Panel>
        <Splitter.Panel min={200} max="30%" defaultSize={300} resizable={false}>
          <Inspector />
        </Splitter.Panel>
      </Splitter>
      <Toolbar />
      <CommandPalette />
    </>
  );
}

export default App;
