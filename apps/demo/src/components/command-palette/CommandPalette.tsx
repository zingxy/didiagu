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
      <Command.Input placeholder="搜索命令..." />
      <Command.List className="command-list">
        <Command.Empty>没有找到结果</Command.Empty>
        <Command.Group heading="命令">
          <Command.Item>
            <div className="desc">
              <span className="icon"></span>
              <span>放大</span>
            </div>
            <div className="keybindings">
              <kbd>Ctrl</kbd>
              <kbd>+</kbd>
            </div>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};

export default CommandPalette;
