import Link from 'next/link';
import { SIDEBAR_MENU } from '../const';
import { Icon } from '@iconify/react/dist/iconify.js';
import { MUSIC } from '../data/music';

export const Sidebar = () => {
  return (
    <div className="flex flex-col justify-between  bg-theme p-4">
      <section id="menu" className="flex flex-col gap-4 ">
        {SIDEBAR_MENU.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-2"
          >
            <Icon icon={item.icon} className="text-xl" />
            <span>{item.name}</span>
          </Link>
        ))}
      </section>
      <section
        id="player"
        className="flex flex-col gap-2 place-items-center justify-center"
      >
        <div className="flex   justify-center   bg-white p-8 w-full rounded-xl">
          <Icon icon="tabler:music" className="text-4xl flex  text-theme" />
        </div>
        <div className="flex flex-col gap-2 justify-center place-items-center">
          <section className="flex items-center gap-2">
            <span>{MUSIC[0].title}</span> - <span>{MUSIC[0].artist}</span>
          </section>
          <section className="flex place-items-center gap-2 place-self-center">
            <Icon icon="fluent:previous-16-filled" className="cursor-pointer" />
            <Icon icon="mdi-light:pause" className="cursor-pointer" />
            <Icon icon="fluent:next-16-filled" className="cursor-pointer" />
          </section>

          <section className="flex place-items-center gap-2">
            <input
              type="range"
              min={0}
              // max={duration}
              // value={currentTime}
              // onChange={(e) => {
              //   const time = Number(e.target.value);

              //   if (audioRef.current) {
              //     audioRef.current.currentTime = time;
              //   }

              //   setCurrentTime(time);
              // }}
            />
            <span>{MUSIC[0].duration}</span>
          </section>
        </div>
      </section>
    </div>
  );
};
