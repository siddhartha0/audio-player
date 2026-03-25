import { FolderSetup } from './folder-setup';

export const LargeScreenHome = () => {
  return (
    <div className="flex flex-col flex-1 gap-4 p-6 bg-white dark:bg-black">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Import music
      </h1>
      <FolderSetup />
    </div>
  );
};
