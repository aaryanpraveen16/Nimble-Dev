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
import Split from "react-split";

const dummyDir: Directory = {
  id: "1",
  name: "loading...",
  type: Type.DUMMY,
  parentDir: undefined,
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

  return (
    <div className="App">
      <Navbar />
      {/* <div
        className="code-editor-terminal-container"
        style={{ display: "flex", height: "100vh", width: "100vw" }}
      > */}
        <Split className="split" sizes={[60,40]} minSize={[700,400]} maxSize={[1200]} gutterSize={10} dragInterval={10}>
        <div
          className="code-editor"
          style={{  display: "flex"}}
        >
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
        </div>
        <div className="output-and-terminal-container">
          <div className="output-container">
            <iframe
              style={{ width: "100%", height: "100%" }}
              src="http://localhost:5174"
              title="Inner App"
            />
          </div>
          <div className="terminal-container">
            <Xterm />
          </div>
        </div>
        </Split>
      {/* </div> */}
    </div>
  );
}

export default App;
