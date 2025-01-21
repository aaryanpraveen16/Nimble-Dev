import { S3Client, ListBucketsCommand, GetObjectCommand, ListObjectsCommand, _Object } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';
import fs from 'fs';
import path, { dirname } from 'path';
import { config } from '../config';
import  {exec}  from 'child_process';
import { Directory } from '../models/directoryModel';
import { generateUniqueId } from '../utils/helpers';
import { File } from '../models/fileModel';

export const files: File[] = [];
export const directories: Directory[] = [];

// Initialize S3 Client
const client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// Get Signed URL for an Object
export async function getObjectUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: 'repl-s3-dev-files',
    Key: key,
  });
  return await getSignedUrl(client, command);
}

// List Files in a Folder
export async function listFilesInFolder(bucketName: string, folderPath: string): Promise<_Object[]> {
  const listObjects = new ListObjectsCommand({
    Bucket: bucketName,
    Prefix: folderPath,
  });
  const response = await client.send(listObjects);
  return response.Contents || [];
}

// Download a File
export async function downloadFile(downloadDir: string, file: _Object): Promise<{ files: File[]; directories: Directory[] }> {
  if (!file.Key) throw new Error('File Key is missing');

  let fileName = path.basename(file.Key.substring(32));
  let dirName = path.dirname(file.Key.substring(32));
  console.log(fileName,dirName)
  let url = await getObjectUrl(file.Key);
  downloadDir = downloadDir + (dirName == "." ? "/" : `${'/'+dirName}`)
  const filePath = path.join(downloadDir + file);
  const response = await axios.get(url);

  // fs.writeFileSync(filePath, response.data);

  const fileEntry: File = {
    id: generateUniqueId(),
    name: fileName,
    parentFolder: path.basename(dirName),
    type: 'file',
    content: response.data,
  };
  files.push(fileEntry);
  if(dirName !== "."){
    const dirEntry: Directory = {
      id: generateUniqueId(),
      name:path.basename(dirName),
      parentFolder:path.basename(path.dirname(dirName)),
      type: 'folder',
    };
    if (!directories.some((dir) => dir.name === dirEntry.name && dir.parentFolder === dirEntry.parentFolder)) {
      directories.push(dirEntry);
    }
  }
  return {files,directories};
}

// Run a File Programmatically
export function runFile(filePath: string): void {
  exec(`node ${filePath}`, (error:Error | null, stdout:string, stderr:string) => {
    if (error) {
      console.error(`Error running file: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error output: ${stderr}`);
      return;
    }
    console.log(`Output: ${stdout}`);
  });
}
