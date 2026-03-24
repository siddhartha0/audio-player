import { Icon } from '@iconify/react';
import { SIDEBAR_MENU } from '../const';
import Link from 'next/link';

export const MobileNavigationBar = () => {
  return (
    <div className="bg-theme p-4 w-full flex justify-between gap-2">
      {SIDEBAR_MENU.map((menu) => (
        <Link
          key={menu.id}
          className="flex flex-col gap-1 place-items-center"
          href={menu.href}
        >
          <Icon icon={menu.icon} className="text-white" />
          <p className="text-xs text-white">{menu.name}</p>
        </Link>
      ))}
    </div>
  );
};
