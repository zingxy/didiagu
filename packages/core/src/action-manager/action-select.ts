import { registerAction } from './action-manager';

const actionSelectAll = registerAction({
  name: 'selectAll',
  label: 'Select All',
  keywords: ['select', 'all', '全部选中'],
  keybinding: 'Ctrl+A',
  perform: ({ editor }) => {
    editor.selectionManager.selectAll();
  },

  keyTest: (e: KeyboardEvent) => {
    return (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a';
  },
});

export { actionSelectAll };
