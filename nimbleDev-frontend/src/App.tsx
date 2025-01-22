import { useEffect, useState } from "react";
import "./App.css";
import { socket } from "./socket";
// import Counter from "./components/Counter";
import EditorComponent from "./EditorComponent";
import {
  buildFileTree,
  Directory,
  File,
  findFileByName,
  Type,
} from "./utils/fileManager";
import Sidebar from "./components/Sidebar";
import { FileTree } from "./components/FileTree";
import Navbar from "./components/Navbar";
import { ReactTerminal } from "react-terminal";
import Xterm from "./components/Xterm";

const dummyDir: Directory = {
  id: "1",
  name: "loading...",
  type: Type.DUMMY,
  parentId: undefined,
  depth: 0,
  dirs: [],
  files: [],
};

function App() {
  const [rootDir, setRootDir] = useState(dummyDir);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const onSelect = (file: File) => {
    setSelectedFile(file);
  };

  useEffect(() => {
    socket.emit("fetchFiles");
    socket.on("filesDownloaded", (downloadedFiles: Directory) => {
      console.log("Files downloaded:", downloadedFiles);
      const rootDir = buildFileTree(downloadedFiles);
      if (!selectedFile) {
        setSelectedFile(findFileByName(rootDir, "main.jsx"));
      }
      setRootDir(rootDir);
    });

    socket.on(
      "fileContent",
      ({ fileName, data }: { fileName: string; data: string }) => {
        console.log(`Received content for ${fileName}:`, data);
      }
    );
    

    // Cleanup WebSocket listeners on unmount
    return () => {
      socket.off("filesDownloaded");
      socket.off("fileContent");
    };
  }, []);
  // handleFileSelect
  // const handleFileSelect = (fileName: string) => {
  //   setSelectedFile(fileName);
  //   socket.emit('getFile', fileName); // Request content for the selected file
  // };

  const sendToServer = (cmd:string) =>{
    socket.emit("cmdFromUI",cmd);
  }
  return (
    <div className="App">
      <Navbar />
      <div className="code-editor">
        <Sidebar>
          <FileTree
            rootDir={rootDir}
            selectedFile={selectedFile}
            onSelect={onSelect}
          />
        </Sidebar>
        <div className="editor-container">
          <EditorComponent selectedFile={selectedFile} />
        </div>
        <div className="output-and-terminal-container">
          <div className="output-container">
            {/* <Counter/> */}
            <iframe style={{width:"100%",height:"100%"}} src="http://localhost:5174" title="Inner App" />
          </div>
          <div className="terminal-container">
            <Xterm/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
