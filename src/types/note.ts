export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  folderId: string | null;
  pinned?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
}
