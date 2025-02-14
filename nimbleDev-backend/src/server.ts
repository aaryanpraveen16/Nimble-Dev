import express, { Application, Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import { config } from "./config";
import {
  listFilesInFolder,
  downloadFile,
  runFile,
} from "./services/s3Services"; // Import the S3 functions from the first file
import { File } from "./models/fileModel";
import { Directory } from "./models/directoryModel";
import { executeCommand } from "./utils/helpers";
import { ChildProcessWithoutNullStreams } from "child_process";
import * as pty from 'node-pty';
// Load environment variables from .env
 import * as Diff from 'diff';

const app: Application = express();
const server: http.Server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});
interface FileTree {
  files: File[];
  directories: Directory[];
}
let fileTree: FileTree;
const port = config.port;
let currentProcess: ChildProcessWithoutNullStreams | null = null;
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();
// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("A user connected");
  let term:any = null;
  socket.on("fetchFiles", async () => {
    try {
      const bucketName = "repl-s3-dev-files";
      const folderPath = "base-files/base-files-for-react/";
      const downloadDir = "execute";
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
      }
      const files = await listFilesInFolder(bucketName, folderPath);
      for (const file of files) {
        if (file.Key && !file.Key.endsWith("/")) {
          fileTree = await downloadFile(downloadDir, file);
        }
      }
      term = pty.spawn('powershell.exe', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: "./execute/",
        env: process.env
      });
      socket.emit("filesDownloaded", fileTree);
    } catch (error) {
      console.error("Error fetching files:", error);
      socket.emit("error", "Failed to fetch files");
    }

  });

  // Serve a specific file on request
  socket.on("getFile", (fileName) => {
    const filePath = path.join("execute", fileName);
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        socket.emit("error", "File not found");
        return;
      }
      socket.emit("fileContent", { fileName, data });
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("cmdFromUI", (cmd: string) => {
    term.write(cmd+"\r");
    // term.write('dir\r');
    term.onData((data:any) => {
      // process.stdout.write(data);
      console.log(data)
      socket.emit("stdoutFromCmd",data)
    });
    term.clear()
    term.onExit((exitCode:number)=>{
      socket.emit("stdoutFromCmd",exitCode)
    })
  });

  socket.on("diff",(patch,code,filename)=>{
const patchedFile = (Diff.applyPatch(code, patch)) || code;
console.log(`./execute/${filename.parentDir}/${filename.name}`);
try{
  fs.writeFileSync(`./src/execute/${filename.parentDir}/${filename.name}`, patchedFile);
}catch(err){
  console.log(err);
}
  })

});

// Start the server
server.listen(port, () => console.log(`Server running on port ${port}`));
