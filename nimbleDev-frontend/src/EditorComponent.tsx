import React, { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { File } from "./utils/fileManager";
import * as Diff from "diff";
import { socket } from "./socket.ts";
interface EditorProps {
  selectedFile: File | undefined;
}

const EditorComponent: React.FC<EditorProps> = ({ selectedFile }) => {
  const [code, setCode] = useState<string | undefined>(selectedFile?.content);
  const [language, setLanguage] = useState<string | undefined>("javascript"); // Default language

  console.log(selectedFile);
  const handleCodeChange = (newVal:any) => {
    let diff;
    if(selectedFile && code){
      diff = Diff.createTwoFilesPatch(selectedFile.name,selectedFile.name,code ,newVal);
      socket.emit("diff",diff,code,selectedFile)
      console.log(selectedFile);
    }


  }
  useEffect(() => {
    if (selectedFile) {
      setCode(selectedFile.content);

      // Determine language based on file extension
      const fileExtension = selectedFile.name.split(".").pop();
      let detectedLanguage: string | undefined;

      switch (fileExtension) {
        case "js":
        case "jsx":
          detectedLanguage = "javascript";
          break;
        case "ts":
        case "tsx":
          detectedLanguage = "typescript";
          break;
        case "css":
          detectedLanguage = "css";
          break;
        case "html":
          detectedLanguage = "html";
          break;
        case "json":
          detectedLanguage = "json";
          break;
        default:
          detectedLanguage = "plaintext"; // Fallback for unknown extensions
      }

      setLanguage(detectedLanguage);
    }
  }, [selectedFile]);

  if (!selectedFile) return null;

  return (
    <div>
      <Editor
        height="100vh"
        language={language}
        value={code}
        width="100%"
        theme="vs-dark"
        onChange={(newVal)=>handleCodeChange(newVal)}
      />
    </div>
  );
};

export default EditorComponent;
