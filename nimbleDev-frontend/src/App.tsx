import { useEffect, useState } from 'react';
import './App.css';
import { socket } from './socket';
import EditorComponent from './EditorComponent';

function App() {
  const [data, setData] = useState<string>(""); // File content
  const [files, setFiles] = useState<string[]>([]); // List of downloaded files
  const [selectedFile, setSelectedFile] = useState<string>(""); // Selected file name

  useEffect(() => {
    // Request the list of files from the server
    socket.emit('fetchFiles');

    // Listen for the list of downloaded files
    socket.on('filesDownloaded', (downloadedFiles: string[]) => {
      console.log('Files downloaded:', downloadedFiles);
      setFiles(downloadedFiles);

      // Automatically load the first file, if available
      if (downloadedFiles.length > 0) {
        setSelectedFile(downloadedFiles[0]);
        socket.emit('getFile', downloadedFiles[0]);
      }
    });

    // Listen for file content
    socket.on('fileContent', ({ fileName, data }: { fileName: string; data: string }) => {
      console.log(`Received content for ${fileName}:`, data);
      setData(data);
    });

    // Cleanup WebSocket listeners on unmount
    return () => {
      socket.off('filesDownloaded');
      socket.off('fileContent');
    };
  }, []);
  // handleFileSelect
  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    socket.emit('getFile', fileName); // Request content for the selected file
  };

  return (
    <div className="App">
      <h1>File Viewer</h1>
      <div className="file-list">
        <h2>Available Files</h2>
        <ul>
          {files.map((file) => (
            <li
              key={file}
              onClick={() => handleFileSelect(file)}
              style={{ cursor: 'pointer', fontWeight: file === selectedFile ? 'bold' : 'normal' }}
            >
              {file}
            </li>
          ))}
        </ul>
      </div>
      <div className="editor-container">
        <EditorComponent data={data} />
      </div>
    </div>
  );
}

export default App;
