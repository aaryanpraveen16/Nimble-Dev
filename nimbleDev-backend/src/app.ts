import { S3Client, ListBucketsCommand, GetObjectCommand, ListObjectsCommand, _Object } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { config } from "./config";

// Initialize S3 Client
console.log(config.aws.accessKeyId);
const client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// Get Signed URL for an Object
async function getObjectUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: "repl-s3-dev-files",
    Key: key,
  });
  const url = await getSignedUrl(client, command);
  return url;
}

// List Files in a Folder
async function listFilesInFolder(bucketName: string, folderPath: string): Promise<_Object[]> {
  const listObjects = new ListObjectsCommand({
    Bucket: bucketName,
    Prefix: folderPath,
  });
  const response = await client.send(listObjects);
  return response.Contents || [];
}

// Download a File
async function downloadFile(downloadDir: string, file: _Object): Promise<string> {
  if (!file.Key) throw new Error("File Key is missing");
  const url = await getObjectUrl(file.Key);
  const filePath = path.join(downloadDir, path.basename(file.Key));

  const response = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(filePath, response.data);
  console.log(`Downloaded: ${filePath}`);
  return filePath;
}

// Run a File Programmatically
function runFile(filePath: string): void {
  exec(`node ${filePath}`, (error, stdout, stderr) => {
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

// Initialize Script
async function init(): Promise<void> {
  const downloadDir = "execute";
  const filesInServer: string[] = [];

  const files = await listFilesInFolder("repl-s3-dev-files", "base-files/JS/");
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  for (const file of files) {
    if (file.Key && !file.Key.endsWith("/")) {
      const filePath = await downloadFile(downloadDir, file);
      filesInServer.push(filePath);
    }
  }

  console.log("Files downloaded:", filesInServer);

  filesInServer.forEach((filePath) => {
    console.log(`${filePath} -----> path`);
    runFile(filePath);
  });
}

// Start the process
init().catch((error) => console.error("Error initializing script:", error));
