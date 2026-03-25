'use client';

import Image from 'next/image';
import { MUSIC } from '../data/music';
import { Icon } from '@iconify/react';
import { useEffect } from 'react';
import { FolderSetup } from './folder-setup';

export const MobileHomeScreen = () => {
  // useEffect(() => {
  //   const dirPermission = async () => {
  //     const dirHandle = await (window as any).showDirectoryPicker();
  //   };

  //   dirPermission();
  // }, []);

  return (
    <FolderSetup />
    // <div className="flex  flex-col  p-3 gap-5">
    //   {MUSIC.map((item) => (
    //     <section
    //       key={item.id}
    //       className="flex  justify-between cursor-pointer place-items-center"
    //       onClick={async () => {
    //         if ('showDirectoryPicker' in window) {
    //           const dirHandle = await window.showDirectoryPicker();
    //           console.log(dirHandle);
    //         } else {
    //           alert('Directory picker not supported. Use file upload instead.');
    //         }
    //       }}
    //     >
    //       <div className="flex gap-2 place-items-center">
    //         <section className="bg-white p-2 rounded-md">
    //           <Image
    //             className="dark:invert"
    //             src={item.img}
    //             alt="Vercel logomark"
    //             width={16}
    //             height={16}
    //           />
    //         </section>

    //         <section className="flex flex-col">
    //           <p className="text-xs">{item.title}</p>
    //           <p className="text-[10px]">{item.album}</p>
    //         </section>
    //       </div>

    //       <div className="flex gap-2">
    //         <Icon icon="weui:like-outlined" />
    //         <Icon icon="ant-design:more-outlined" />
    //       </div>
    //     </section>
    //   ))}
    // </div>
  );
};
