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

  // ── New state ──────────────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return () => {
      for (const t of tracksRef.current) URL.revokeObjectURL(t.url);
    };
  }, []);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  // When selected track changes, load and auto-play
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.load();
    audioRef.current.play();
    setIsPlaying(true);
    setProgress(0);
  }, [selectedTrackId]);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) ?? null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrev = () => {
    const idx = tracks.findIndex((t) => t.id === selectedTrackId);
    const newIdx = (idx - 1 + tracks.length) % tracks.length;
    setSelectedTrackId(tracks[newIdx].id);
  };

  const handleNext = () => {
    const idx = tracks.findIndex((t) => t.id === selectedTrackId);
    const newIdx = (idx + 1) % tracks.length;
    setSelectedTrackId(tracks[newIdx].id);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = val;
    setProgress(val);
  };

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  async function handlePickFolder() {
    setError(null);
    setIsImporting(true);
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
      <div className="h-full bg-theme text-white p-3">
        <button onClick={handlePickFolder}>Choose music folder</button>

        {isImporting ? <p>Importing...</p> : null}
        {error ? (
          <p className="text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {tracks.length > 0 ? (
          <div className="flex h-full flex-col justify-between mt-4">
            {/* ── Track list ───────────────────────────────────────────────── */}
            <div className="flex flex-col gap-2 overflow-scroll">
              {tracks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrackId(t.id)}
                  className={`px-2 py-1 flex cursor-pointer justify-between place-items-center gap-2 ${
                    selectedTrackId === t.id ? 'opacity-100' : 'opacity-60'
                  }`}
                  type="button"
                >
                  <div className="flex place-items-center text-start gap-2">
                    <section className="bg-white p-2 rounded-md">
                      <Image
                        className="dark:invert"
                        src={'/vercel.svg'}
                        alt="Vercel logomark"
                        width={16}
                        height={16}
                      />
                    </section>
                    <p className="text-[10px]">{t.title}</p>
                  </div>

                  <div className="flex gap-2">
                    <Icon icon="weui:like-outlined" />
                    <Icon icon="ant-design:more-outlined" />
                  </div>
                </button>
              ))}
            </div>

            {/* ── Player UI ────────────────────────────────────────────────── */}
            <div className="border rounded-2xl shadow-md px-4 py-3 flex flex-col gap-2 bg-red-50">
              <div className="flex items-center gap-3">
                {/* Info */}
                <div className="flex flex-col flex-1 min-w-0">
                  <section className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 truncate">
                      {selectedTrack?.title}
                    </span>
                  </section>

                  <section className="flex place-items-center gap-2 place-self-center mt-1">
                    <Icon
                      icon="fluent:previous-16-filled"
                      className="cursor-pointer text-gray-500 hover:text-gray-800"
                      onClick={handlePrev}
                    />
                    <Icon
                      icon={isPlaying ? 'mdi-light:pause' : 'mdi-light:play'}
                      className="cursor-pointer text-gray-500 hover:text-gray-800 text-xl"
                      onClick={togglePlay}
                    />
                    <Icon
                      icon="fluent:next-16-filled"
                      className="cursor-pointer text-gray-500 hover:text-gray-800"
                      onClick={handleNext}
                    />
                  </section>
                </div>

                {/* Pause/Play pill */}
                <button
                  onClick={togglePlay}
                  className="flex items-center gap-1 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shrink-0"
                >
                  <Icon icon={isPlaying ? 'mdi:pause' : 'mdi:play'} />
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>

              {/* ── Progress bar + timestamps ───────────────────────────────── */}
              <div className="flex flex-col gap-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={handleSeek}
                  className="w-full accent-gray-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{fmt(progress)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>
            </div>

            {/* ── Hidden audio element ────────────────────────────────────── */}
            <audio
              ref={audioRef}
              src={selectedTrack?.url ?? undefined}
              onTimeUpdate={() =>
                setProgress(audioRef.current?.currentTime ?? 0)
              }
              onLoadedMetadata={() =>
                setDuration(audioRef.current?.duration ?? 0)
              }
              onEnded={handleNext}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        ) : null}
      </div>
    );
  }

  // mobile fallback
  return <MobileImport />;
}
