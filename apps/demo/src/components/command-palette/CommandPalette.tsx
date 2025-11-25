import { Command } from 'cmdk';
import './CommandPalette.scss';
import * as React from 'react';

const CommandPalette = () => {
  const [open, setOpen] = React.useState(false);

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed top-1/2 left-1/2 w-[480px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-md border bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
    >
      <Command.Input placeholder="搜索命令..." className="command-input" />
      <Command.List className="command-list">
        <Command.Empty className="command-empty">没有找到结果</Command.Empty>

        <Command.Group heading="工具" className="command-group">
          <Command.Item className="command-item">
            <span className="command-item-icon">◻</span>
            <span>矩形工具</span>
            <span className="command-item-shortcut">R</span>
          </Command.Item>
          <Command.Item className="command-item">
            <span className="command-item-icon">○</span>
            <span>椭圆工具</span>
            <span className="command-item-shortcut">O</span>
          </Command.Item>
          <Command.Item className="command-item">
            <span className="command-item-icon">▢</span>
            <span>画框工具</span>
            <span className="command-item-shortcut">F</span>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="操作" className="command-group">
          <Command.Item className="command-item">
            <span className="command-item-icon">⌦</span>
            <span>删除</span>
            <span className="command-item-shortcut">Delete</span>
          </Command.Item>
          <Command.Item className="command-item">
            <span className="command-item-icon">☐</span>
            <span>全选</span>
            <span className="command-item-shortcut">Ctrl+A</span>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="视图" className="command-group" comm>
          <Command.Item className="command-item">
            <span className="command-item-icon">🔍</span>
            <span>放大</span>
            <span className="command-item-shortcut">Ctrl++</span>
          </Command.Item>
          <Command.Item className="command-item">
            <span className="command-item-icon">🔍</span>
            <span>缩小</span>
            <span className="command-item-shortcut">Ctrl+-</span>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};

export default CommandPalette;
