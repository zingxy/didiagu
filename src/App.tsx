import { useEffect, useRef } from 'react';
import { Editor } from './editor';
function App() {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 如果已经有编辑器实例，直接返回
    if (editorRef.current) {
      return;
    }

    let ignore = false;
    const editor = new Editor();

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

  return <div ref={containerRef}></div>;
}

export default App;
