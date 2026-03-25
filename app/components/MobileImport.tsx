// components/MobileImport.tsx
'use client';
import { useEffect, useRef, useState } from 'react';

type ImportedTrack = { id: string; title: string; url: string };

export function MobileImport() {
  const [tracks, setTracks] = useState<ImportedTrack[]>([]);
  const tracksRef = useRef(tracks);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) ?? null;

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    // Cleanup blob URLs when component unmounts.
    return () => {
      for (const t of tracksRef.current) URL.revokeObjectURL(t.url);
    };
  }, []);

  const handleFiles = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setError(null);
    setIsImporting(true);

    // Revoke previous URLs (if any) before importing new tracks.
    for (const t of tracksRef.current) URL.revokeObjectURL(t.url);
    setTracks([]);
    setSelectedTrackId(null);

    try {
      const newTracks: ImportedTrack[] = [];
      for (const file of files) {
        const url = URL.createObjectURL(file);
        const id = `${file.name}-${file.size}-${file.lastModified}`;
        newTracks.push({ id, title: file.name, url });
      }

      setTracks(newTracks);
      setSelectedTrackId(newTracks[0]?.id ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to import music files'
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div>
      <label>
        <input
          type="file"
          accept="audio/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFiles}
        />
        <button
          onClick={(e) =>
            (e.currentTarget.previousElementSibling as
              | HTMLInputElement
              | null)?.click()
          }
          disabled={isImporting}
          type="button"
        >
          {isImporting ? 'Importing...' : 'Import music files'}
        </button>
      </label>

      {error ? (
        <p className="text-red-600 mt-2" role="alert">
          {error}
        </p>
      ) : null}

      {tracks.length > 0 ? (
        <div className="flex flex-col gap-3 mt-4">
          <audio
            controls
            src={selectedTrack?.url ?? undefined}
            style={{ width: '100%' }}
          />

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
