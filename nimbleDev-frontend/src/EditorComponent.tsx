import React, { useState } from "react";
import MonacoEditor from "@uiw/react-monacoeditor";

interface EditorProps {
  data: string;
}
const EditorComponent: React.FC<EditorProps> = ({ data }) => {
  const [value, setvalue] = useState(data);
  const onChange = React.useCallback((val: any) => {
    console.log("val:", val);
    setvalue(val);
  }, []);
  return (
    <div style={{ height: "100vh", width: "50vw" }}>
      <MonacoEditor
        language="javascript"
        value={data}
        height="100%"
        width="100%"
        onChange={(newVal)=>onChange(newVal)}
        options={{
          theme: "vs-dark",
        }}
      />
    </div>
  );
};
export default EditorComponent;
