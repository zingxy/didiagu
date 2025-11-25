import { registerAction } from './action-manager';

const actionDelete = registerAction({
  name: 'delete',
  label: 'Delete',
  keywords: ['delete', 'remove', '删除'],
  keybinding: 'Delete',
  perform: ({ editor }) => {},

  keyTest: (e: KeyboardEvent) => {
    return e.key === 'Delete';
  },
});

export { actionSelectAll };
