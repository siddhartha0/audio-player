// db.ts
import { Dexie, type EntityTable } from 'dexie';

interface MusicType {
  id: string;
  title: string;
  url: string;
}

const musicDb = new Dexie('MusicDatabase') as Dexie & {
  music: EntityTable<
    MusicType,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
musicDb.version(1).stores({
  music: '++id, title, url', // primary key "id" (for the runtime!)
});

export type { MusicType };
export { musicDb };
