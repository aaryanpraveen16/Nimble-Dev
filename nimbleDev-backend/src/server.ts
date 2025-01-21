import express, { Application, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import {
  listFilesInFolder,
  downloadFile,
  runFile,
} from './services/s3Services'; // Import the S3 functions from the first file
import { File } from './models/fileModel';
import { Directory } from './models/directoryModel';
import {executeCommand} from "./utils/helpers"
// Load environment variables from .env


const app: Application = express();
const server: http.Server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});
interface FileTree {
  files: File[],
  directories:Directory[]
}
let fileTree:FileTree;
const port = config.port;

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for a request to fetch files from S3
  socket.on('fetchFiles', async () => {
    try {
      const bucketName = 'repl-s3-dev-files';
      const folderPath = 'base-files/base-files-for-react/';
      const downloadDir = 'execute';

      // Create download directory if it doesn't exist
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
      }

      // Fetch file list from S3
      const files = await listFilesInFolder(bucketName, folderPath);

      
      for (const file of files) {
        if (file.Key && !file.Key.endsWith('/')) {
          let filePath = "";
          
          // console.log(path.dirname(file.Key.substring(32)), "dirname",path.basename(file.Key.substring(32)),"filename")
           
            fileTree = await downloadFile(downloadDir, file);
          }
        }
      

      // console.log('Files downloaded:', downloadedFiles);

      // Send the list of downloaded files to the client
      socket.emit('filesDownloaded', fileTree);

      // Optionally, execute each downloaded file
      // downloadedFiles.forEach((filePath) => {
      //   console.log(`${filePath} -----> path`);
      //   runFile(filePath);
      // });
    } catch (error) {
      console.error('Error fetching files:', error);
      socket.emit('error', 'Failed to fetch files');
    }
  
  });

  // Serve a specific file on request
  socket.on('getFile', (fileName) => {
    const filePath = path.join('execute', fileName);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        socket.emit('error', 'File not found');
        return;
      }
      socket.emit('fileContent', { fileName, data });
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on("cmdFromUI",async (cmd:string)=>{
    const result = await executeCommand(cmd);
    socket.emit("stdoutFromCmd",result);
    console.log(result,"---------> result")
  })
});

// Start the server
server.listen(port, () => console.log(`Server running on port ${port}`));
