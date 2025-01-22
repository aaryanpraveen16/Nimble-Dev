import React, { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { socket } from "../socket.ts";
import "./XtermStyles.css"; // Import your custom scrollbar styles
import { FitAddon } from '@xterm/addon-fit';

const Xterm = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  let inputBuffer = ""; // Regular variable to store user input
  const fitAddon = new FitAddon();
  fitAddon.fit();
  useEffect(() => {
    // Initialize the Terminal instance
    const terminal = new Terminal({
      cursorBlink: true, // Enable blinking cursor
      rows: 20,
    });
    terminalInstance.current = terminal;

    // Attach the terminal to the DOM element
    if (terminalRef.current) {
      terminal.open(terminalRef.current);

      // Display a welcome message
      terminal.writeln("Type commands and press Enter to execute.\r\n");
      terminal.write("> ");

      // Handle user input
      terminal.onData((data: string) => {
        handleUserInput(data);
      });
    }

    // Handle server responses
    socket.on("stdoutFromCmd", (stdout: string) => {
      console.log(stdout, "stdout");
      terminal.writeln(stdout);
      terminal.write("> ");
    });

    return () => {
      // Cleanup the terminal instance and socket listener
      terminal.dispose();
      socket.off("stdoutFromCmd");
    };
  }, []);

  const handleUserInput = (data: string) => {
    if (data === "\r") {
      // User pressed Enter
      terminalInstance.current?.write("\r\n");
      sendToServer();
      inputBuffer = ""; // Clear the input buffer
      terminalInstance.current?.write("> "); // Display the prompt
    }else if (data === "\u0003") {
      // Handle Ctrl+C (exit or cancel)
      inputBuffer = "CTRL+C";
      terminalInstance.current?.write("^C\r\n");
      sendToServer();
      inputBuffer="";
      terminalInstance.current?.write("> ");
    }  
    else if (data === "\u007F") {
      // Handle Backspace
      if (inputBuffer.length > 0) {
        inputBuffer = inputBuffer.slice(0, -1); // Update the buffer
        terminalInstance.current?.write("\b \b"); // Remove character visually
      }
    } else {
      // Append typed character to the buffer and display it
      inputBuffer += data;
      terminalInstance.current?.write(data); // Display the character
    }

    console.log("Current Input Buffer:", inputBuffer); // Debugging the buffer
  };

  const sendToServer = () => {
    if (inputBuffer.trim() === "") {
      terminalInstance.current?.writeln("No command entered.");
    } else {
      console.log("Command sent:", inputBuffer);
      socket.emit("cmdFromUI", inputBuffer); // Emit the command to the server
    }
  };

  return (
    <div>
      <div
        className="terminal-container"
        ref={terminalRef}
        style={{
          width: "100%",
          height: "50vh",
          backgroundColor: "black",
        }}
      ></div>
    </div>
  );
};

export default Xterm;
