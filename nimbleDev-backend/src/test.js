
//  import * as Diff from 'diff';
//  import fs from "fs"
//  const file1Contents = "// some comment";
//  const file2Contents = `// some comment asd
// asdsa
// asdasd`;
//  const patch = Diff.createTwoFilesPatch("file1.txt", "file2.txt", file1Contents, file2Contents);
//  console.log(patch);
// const patchedFile = Diff.applyPatch(file1Contents, patch);
// fs.writeFileSync("file1.txt", patchedFile);
import path from 'path';
let url = "src/assets/background"

// console.log(path.basename(url));
console.log(path.basename(path.dirname(url)))
