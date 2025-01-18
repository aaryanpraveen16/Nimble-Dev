import { S3Client, ListBucketsCommand, GetObjectCommand, ListObjectsCommand, _Object } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import  {exec}  from 'child_process';
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
export async function downloadFile(downloadDir: string, file: _Object): Promise<string> {
  if (!file.Key) throw new Error('File Key is missing');
  const url = await getObjectUrl(file.Key);
  const filePath = path.join(downloadDir, path.basename(file.Key));

  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filePath, response.data);
  console.log(`Downloaded: ${filePath}`);
  return path.basename(filePath);
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
