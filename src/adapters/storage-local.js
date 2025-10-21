import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pseudoCIDFromJSON } from "../core/cid.js";

const ROOT = join(dirname(fileURLToPath(new URL("./", import.meta.url))), "..", "..", "storage");

async function ensureDir(){
  await fs.mkdir(ROOT, { recursive: true });
}

export async function putJSON(obj){
  const json = JSON.stringify(obj);
  const cid = pseudoCIDFromJSON(json);
  await ensureDir();
  await fs.writeFile(join(ROOT, cid + ".json"), json, "utf-8");
  return cid;
}

export async function getJSON(cid){
  const path = join(ROOT, cid + ".json");
  const raw = await fs.readFile(path, "utf-8");
  return JSON.parse(raw);
}
