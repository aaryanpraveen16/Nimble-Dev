export interface Directory {
  id: string;
  name: string;
  parentFolder: string;
  type: 'file' | 'folder';
}
