import * as crypto from "crypto";
import {spawn} from "child_process";

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
export function executeCommand(command: string) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command}`);

    // Spawn the process

    const process = spawn(command, { stdio: "inherit", shell: true });
    let output = "";
    let errorOutput = '';
    // if (process.stdout == null || process.stderr == null) throw new Error("File Key is missing");
    // Capture standard output
    process.stdout?.on("data", (data: string) => {
      output += data.toString();
    });
    // Capture error output
    process.stderr?.on("data", (data:string) => {
      errorOutput += data.toString();
    });
    // Handle process completion
    process.on("close", (code: number) => {
      if (code === 0) {
        resolve(`Process completed successfully with code: ${code}`);
      } else {
        reject(`Process exited with error code: ${code}`);
      }
    });

    // Handle process errors
    process.on("error", (err: { message: string }) => {
      reject(`Error spawning process: ${err.message}`);
    });
  });
}
