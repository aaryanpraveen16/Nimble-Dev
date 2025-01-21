export enum Type {
  FILE,
  DIRECTORY,
  DUMMY,
}

interface CommonProps {
  id: string;
  type: Type;
  name: string;
  parentId: string | undefined;
  depth: number;
}

export interface File extends CommonProps {
  content: string;
}

export interface Directory extends CommonProps {
  files: File[];
  dirs: Directory[];
}

/**
 *
 * @param data
 */
export function buildFileTree(data: any): Directory {
  const dirs = data.directories;
  const files = data.files;
  const cache = new Map<string, Directory | File>();
  let rootDir: Directory = {
    id: "0",
    name: "root",
    parentId: undefined,
    type: Type.DIRECTORY,
    depth: 0,
    dirs: [],
    files: [],
  };

  dirs.forEach((item: any) => {
    let dir: Directory = {
      id: item.id,
      name: item.name,
      parentId: item.parentFolder === null ? "." : item.parentFolder,
      type: Type.DIRECTORY,
      depth: 0,
      dirs: [],
      files: [],
    };

    cache.set(dir.name, dir);
  });
  files.forEach((item: any) => {
    let file: File = {
      id: item.id,
      name: item.name,
      parentId: item.parentFolder === null ? "." : item.parentFolder,
      type: Type.FILE,
      depth: 0,
      content: item.content,
    };
    cache.set(file.name, file);
  });
  cache.forEach((value, key) => {
    if (value.parentId === ".") {
      if (value.type === Type.DIRECTORY) rootDir.dirs.push(value as Directory);
      else rootDir.files.push(value as File);
    } else {
      const parentDir = cache.get(value.parentId as string) as Directory;
      if (value.type === Type.DIRECTORY) {
        parentDir.dirs.push(value as Directory);
      } else parentDir.files.push(value as File);
    }
  });

  getDepth(rootDir, 0);

  return rootDir;
}

/**
 * @param rootDir
 * @param curDepth
 */
function getDepth(rootDir: Directory, curDepth: number) {
  rootDir.files.forEach((file) => {
    file.depth = curDepth + 1;
  });
  rootDir.dirs.forEach((dir) => {
    dir.depth = curDepth + 1;
    getDepth(dir, curDepth + 1);
  });
}

export function findFileByName(
  rootDir: Directory,
  filename: string
): File | undefined {
  let targetFile: File | undefined = undefined;

  function findFile(rootDir: Directory, filename: string) {
    rootDir.files.forEach((file) => {
      if (file.name === filename) {
        targetFile = file;
        return;
      }
    });
    rootDir.dirs.forEach((dir) => {
      findFile(dir, filename);
    });
  }

  findFile(rootDir, filename);
  return targetFile;
}

export function sortDir(l: Directory, r: Directory) {
  return l.name.localeCompare(r.name);
}

export function sortFile(l: File, r: File) {
  return l.name.localeCompare(r.name);
}
