// components/FolderSetup.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { requestMusicFolder, scanFolder } from '../lib/filesystem';
import { MobileImport } from './MobileImport';
import Image from 'next/image';
import { Icon } from '@iconify/react';

const canUseFSA =
  typeof window !== 'undefined' && 'showDirectoryPicker' in window;

export function FolderSetup() {
  const [_, setFolderName] = useState<string | null>(null);
  const [tracks, setTracks] = useState<
    Array<{ id: string; title: string; url: string }>
  >([]);
  const tracksRef = useRef(tracks);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup blob URLs when component unmounts.
    return () => {
      for (const t of tracksRef.current) URL.revokeObjectURL(t.url);
    };
  }, []);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) ?? null;

  async function handlePickFolder() {
    setError(null);
    setIsImporting(true);

    // Revoke previous URLs (if any) before importing new tracks.
    for (const t of tracks) URL.revokeObjectURL(t.url);
    setTracks([]);
    setSelectedTrackId(null);

    try {
      const handle = await requestMusicFolder();
      setFolderName(handle.name);

      const fileHandles = await scanFolder(handle);

      console.log(fileHandles, 'files from imported folder');

      const newTracks: Array<{ id: string; title: string; url: string }> = [];
      for (const fileHandle of fileHandles) {
        const file = await fileHandle.getFile();

        console.log(file, 'file details');
        const url = URL.createObjectURL(file);
        const id = `${file.name}-${file.size}-${file.lastModified}`;
        newTracks.push({ id, title: file.name, url });
      }

      setTracks(newTracks);
      setSelectedTrackId(newTracks[0]?.id ?? null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to import music folder'
      );
    } finally {
      setIsImporting(false);
    }
  }

  if (canUseFSA) {
    return (
      <div className="h-full p-3">
        <button onClick={handlePickFolder}>Choose music folder</button>

        {isImporting ? <p>Importing...</p> : null}
        {error ? (
          <p className="text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {tracks.length > 0 ? (
          <div className="flex  h-full flex-col justify-between mt-4 ">
            <div className="flex h-[80%] flex-col gap-2 overflow-scroll">
              {tracks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrackId(t.id)}
                  className={`px-2 py-1  flex   cursor-pointer  justify-between place-items-center gap-2  `}
                  type="button"
                >
                  <div className="flex gap-2 place-items-center">
                    <section className="bg-white p-2 rounded-md">
                      <Image
                        className="dark:invert"
                        src={'/vercel.svg'}
                        alt="Vercel logomark"
                        width={16}
                        height={16}
                      />
                    </section>

                    <p className="text-xs">{t.title}</p>
                  </div>

                  <div className="flex gap-2">
                    <Icon icon="weui:like-outlined" />
                    <Icon icon="ant-design:more-outlined" />
                  </div>
                </button>
              ))}
            </div>

            <div className="h-[20%]">
              <audio
                controls
                src={selectedTrack?.url ?? undefined}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // mobile fallback
  return <MobileImport />;
}
