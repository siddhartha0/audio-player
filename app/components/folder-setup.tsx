// components/FolderSetup.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import {
  requestMusicFolder,
  scanFolder,
} from '../lib/filesystem';
import { MobileImport } from './MobileImport';

const canUseFSA =
  typeof window !== 'undefined' && 'showDirectoryPicker' in window;

export function FolderSetup() {
  const [folderName, setFolderName] = useState<string | null>(null);
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

      const newTracks: Array<{ id: string; title: string; url: string }> = [];
      for (const fileHandle of fileHandles) {
        const file = await fileHandle.getFile();
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
      <div>
        {folderName ? (
          <p>
            Watching: <strong>{folderName}</strong>
          </p>
        ) : (
          <button onClick={handlePickFolder}>Choose music folder</button>
        )}

        {isImporting ? <p>Importing...</p> : null}
        {error ? (
          <p className="text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {tracks.length > 0 ? (
          <div className="flex flex-col gap-3 mt-4">
            <div>
              <audio
                controls
                src={selectedTrack?.url ?? undefined}
                style={{ width: '100%' }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {tracks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrackId(t.id)}
                  className={`px-2 py-1 rounded-md border ${
                    t.id === selectedTrackId
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black/20'
                  }`}
                  type="button"
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // mobile fallback
  return <MobileImport />;
}
