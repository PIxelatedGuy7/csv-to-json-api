import fs from "fs";
import readline from "readline";

//returns a Promise that resolves to an array of object
export async function parseCSVStream(filePath) {
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream });

  let headers = [];
  const results = [];
  let isHeader = true;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isHeader) {
      headers = trimmed.split(",").map(h => h.trim());
      isHeader = false;
      continue;
    }

    const values = trimmed.split(",").map(v => v.trim());
    const obj = {};
    for (let i = 0; i < headers.length; i++) {
      setNestedProperty(obj, headers[i], values[i]);
    }
    results.push(obj);
  }

  return results;
}

function setNestedProperty(obj, path, value) {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) current[key] = {};
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}
