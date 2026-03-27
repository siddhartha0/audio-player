import { RefObject } from 'react';
import { requestMusicFolder, scanFolder } from './filesystem';

interface TrackTypes {
  id: string;
  title: string;
  url: string;
}

interface togglePlayTypes {
  audioRef: RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export const togglePlay = ({
  audioRef,
  isPlaying,
  setIsPlaying,
}: togglePlayTypes) => {
  if (!audioRef.current) return;
  if (isPlaying) {
    audioRef.current.pause();
  } else {
    audioRef.current.play();
  }
  setIsPlaying(!isPlaying);
};

interface handlePrevNextTypes {
  tracks: TrackTypes[];
  selectedTrackId: string | null;
  setSelectedTrackId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const handlePrev = ({
  tracks,
  selectedTrackId,
  setSelectedTrackId,
}: handlePrevNextTypes) => {
  const idx = tracks.findIndex((t) => t.id === selectedTrackId);
  const newIdx = (idx - 1 + tracks.length) % tracks.length;
  setSelectedTrackId(tracks[newIdx].id);
};

export const handleNext = ({
  selectedTrackId,
  setSelectedTrackId,
  tracks,
}: handlePrevNextTypes) => {
  const idx = tracks.findIndex((t) => t.id === selectedTrackId);
  const newIdx = (idx + 1) % tracks.length;
  setSelectedTrackId(tracks[newIdx].id);
};

interface hanldeSeekTypes {
  audioRef: RefObject<HTMLAudioElement | null>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  e: React.ChangeEvent<HTMLInputElement>;
}

export const handleSeek = ({ audioRef, e, setProgress }: hanldeSeekTypes) => {
  const val = Number(e.target.value);
  if (audioRef.current) audioRef.current.currentTime = val;
  setProgress(val);
};

interface handlePickFolderTypes {
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>;
  tracks: TrackTypes[];
  setTracks: React.Dispatch<React.SetStateAction<TrackTypes[]>>;
  setSelectedTrackId: React.Dispatch<React.SetStateAction<string | null>>;
  setFolderName: React.Dispatch<React.SetStateAction<string | null>>;
}

export const fmt = (s: number) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export async function handlePickFolder({
  setError,
  setIsImporting,
  setFolderName,
  setSelectedTrackId,
  setTracks,
  tracks,
}: handlePickFolderTypes) {
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
    setError(e instanceof Error ? e.message : 'Failed to import music folder');
  } finally {
    setIsImporting(false);
  }
}
