import { LargeScreenHome, MobileHomeScreen } from './components';

export default function Home() {
  return (
    <main className="flex h-full w-full ">
      <div className="hidden md:flex w-full">
        <LargeScreenHome />
      </div>

      <div className="md:hidden w-full ">
        <MobileHomeScreen />
      </div>
    </main>
  );
}
