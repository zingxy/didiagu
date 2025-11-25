import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { actionSelectAll } from '@didiagu/core/src/action-manager';
import { useAppState } from '@/store';
type Item = NonNullable<MenuProps['items']>[number];

const ContextMenu: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { editor } = useAppState((state) => state);
  const actions: Item[] = [
    {
      key: actionSelectAll.name,
      label: (
        <div className="flex w-48 justify-around">
          <span>{actionSelectAll.label}</span>
          <span className="text-gray-400 text-sm">
            {actionSelectAll.keybinding}
          </span>
        </div>
      ),
      onClick: () => {
        editor?.actionManager.executeAction(actionSelectAll);
      },
    },
  ];
  return (
    <Dropdown trigger={['contextMenu']} menu={{ items: actions }}>
      <div style={{ width: '100%', height: '100%' }}>{children}</div>
    </Dropdown>
  );
};

export default ContextMenu;
