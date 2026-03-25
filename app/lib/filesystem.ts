type PermissionState = 'granted' | 'denied' | 'prompt';

type WindowWithShowDirectoryPicker = Window & {
  showDirectoryPicker?: (options: {
    mode: 'read';
    startIn?: string;
  }) => Promise<FileSystemDirectoryHandle>;
};

type ExperimentalDirectoryHandle = FileSystemDirectoryHandle & {
  queryPermission?: (options: { mode: 'read' }) => Promise<PermissionState>;
  requestPermission?: (options: { mode: 'read' }) => Promise<PermissionState>;
  values?: () => AsyncIterable<{ name: string; kind: 'file' | 'directory' }>;
  entries?: () => AsyncIterable<
    [string, FileSystemFileHandle | FileSystemDirectoryHandle]
  >;
};

export async function requestMusicFolder() {
  const win = window as unknown as WindowWithShowDirectoryPicker;
  if (!win.showDirectoryPicker) {
    throw new Error('Directory picker not supported in this browser');
  }

  return win.showDirectoryPicker({
    mode: 'read',
    startIn: 'music',
  });
}

const AUDIO_EXTENSIONS = [
  '.mp3',
  '.flac',
  '.aac',
  '.ogg',
  '.wav',
  '.opus',
  '.m4a',
];

export async function scanFolder(dirHandle: FileSystemDirectoryHandle) {
  const experimentalHandle =
    dirHandle as unknown as ExperimentalDirectoryHandle;
  const files: FileSystemFileHandle[] = [];

  // check 1 — is the handle valid at all?
  console.log('handle name:', dirHandle.name);
  console.log('handle kind:', dirHandle.kind);

  // check 2 — do we still have permission?
  let permission: PermissionState = 'granted';
  if (typeof experimentalHandle.queryPermission === 'function') {
    permission = await experimentalHandle.queryPermission({ mode: 'read' });
  }
  console.log('permission status:', permission); // should be 'granted'

  console.log(experimentalHandle, 'experiement handle');

  // check 3 — force re-request if not granted
  if (permission !== 'granted') {
    const result = await experimentalHandle.requestPermission?.({
      mode: 'read',
    });
    const finalResult = result ?? 'denied';
    console.log('re-requested permission:', result);
    if (finalResult !== 'granted') {
      console.error('permission denied — cannot scan');
      return files;
    }
  }

  // check 4 — try reading entries manually first
  let entryCount = 0;
  if (typeof experimentalHandle.values === 'function') {
    for await (const entry of experimentalHandle.values()) {
      entryCount++;
      console.log('found entry:', entry.name, entry.kind);
      if (entryCount > 5) {
        console.log('(stopping preview at 5)');
        break;
      }
    }
    console.log('total entries found in preview:', entryCount);
  }

  // your original loop
  if (typeof experimentalHandle.entries === 'function') {
    for await (const [name, childHandle] of experimentalHandle.entries()) {
      if (childHandle.kind === 'file') {
        const dotIndex = name.lastIndexOf('.');
        if (dotIndex === -1) continue;
        const ext = name.slice(dotIndex).toLowerCase();
        if (AUDIO_EXTENSIONS.includes(ext)) files.push(childHandle);
      } else if (childHandle.kind === 'directory') {
        const nested = await scanFolder(childHandle);
        files.push(...nested);
      }
    }
  }

  return files;
}
