export interface File {
  id: string;
  name: string;
  parentFolder: string;
  type: 'file' | 'folder';
  content: string;
}
