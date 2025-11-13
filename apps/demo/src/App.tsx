import { useEffect, useRef } from 'react';
import { Editor, Rect } from '@didiagu/core';
import { Flex, Splitter, Typography } from 'antd';
function App() {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 如果已经有编辑器实例，直接返回
    if (editorRef.current) {
      return;
    }

    let ignore = false;
    console.log(
      'containerRef.current',
      containerRef.current?.clientWidth,
      containerRef.current?.clientHeight
    );
    const editor = new Editor({
      width: containerRef.current?.clientWidth,
      height: containerRef.current?.clientHeight,
      background: '#f0f2f5',
      resizeTo: containerRef.current || undefined,
    });
    editor.bus.on('editor.initialized', () => {
      editor.sceneGraph.removeChildren();
      editor.sceneGraph.addChild(new Rect({ x: 100, y: 100, w: 200, h: 150 }));
    });

    editor.init().then(() => {
      if (ignore) {
        editor.destroy();
        return;
      }

      // 只有在没有被取消的情况下才设置引用和添加到DOM
      editorRef.current = editor;
      if (
        containerRef.current &&
        !containerRef.current.contains(editor.app.canvas)
      ) {
        containerRef.current.appendChild(editor.app.canvas);
      }
    });

    return () => {
      ignore = true;
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <Splitter className="h-screen" style={{ height: '100vh' }}>
        <Splitter.Panel min={200} max="30%" defaultSize={200}>
          <Desc text={1} />
        </Splitter.Panel>
        <Splitter.Panel>
          <div ref={containerRef} className="w-full h-full" />
        </Splitter.Panel>
        <Splitter.Panel min={300} max="30%" defaultSize={300}>
          <Desc text={3} />
        </Splitter.Panel>
      </Splitter>
    </>
  );
}
const Desc: React.FC<Readonly<{ text?: string | number }>> = (props) => (
  <Flex justify="center" align="center" style={{ height: '100%' }}>
    <Typography.Title
      type="secondary"
      level={5}
      style={{ whiteSpace: 'nowrap' }}
    >
      Panel {props.text}
    </Typography.Title>
  </Flex>
);

export default App;
