import * as crypto from "crypto";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Socket } from "socket.io";
const controller = new AbortController();
const { signal } = controller;

export function hashString(
  input: string,
  algorithm: string = "sha256"
): string {
  // Create a hash object using the specified algorithm
  const hash = crypto.createHash(algorithm);

  // Update the hash with the input string
  hash.update(input);

  // Return the resulting hash as a hexadecimal string
  return hash.digest("hex");
}
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Function to spawn a process with dynamic command and arguments
export function executeCommand(command: string, socket: Socket) {
    console.log(`Executing: ${command}`);

    // Spawn the process
    const current = spawn(command, {
      stdio: "pipe",
      shell: true,
      cwd: "./execute",
      signal
    });
    let output = "";
    let errorOutput = "";
    current.unref();
    // Capture standard output
    current.stdout?.on("data", (data: string) => {
      socket.emit("stdoutFromCmd", data.toString());
    });
    current.on("SIGTERM", () => {
      console.log("Received SIGTERM. Exiting...");
      // process.stdin.end();
      // current.kill("SIGTERM");
      // process.exit();
      controller.abort();

    });
    // Capture error output
    current.stderr?.on("data", (data: string) => {
      socket.emit("stdoutFromCmd", `Error: ${data.toString()}`);
    });

    // Handle process completion
    current.on("close", (code: number) => {
      socket.emit(
        "stdoutFromCmd",
        `Process completed with exit code ${code}.`
      );
    });
    console.log(current.pid);
  // Handle process errors
  current.on("error", (err: { message: string }) => {
    socket.emit("stdoutFromCmd", `Error spawning process: ${err.message}`);
  });
  return current;
}
