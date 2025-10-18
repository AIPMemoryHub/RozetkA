import { promises as fs } from "fs";
import { join } from "path";
import { pseudoCIDFromJSON } from "../core/cid.js";

const ROOT = "storage";

export async function putJSON(obj: any){
  const json = JSON.stringify(obj);
  const cid = pseudoCIDFromJSON(json);
  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(join(ROOT, cid + ".json"), json, "utf-8");
  return cid;
}

export async function getJSON(cid: string){
  const p = join(ROOT, cid + ".json");
  const s = await fs.readFile(p, "utf-8");
  return JSON.parse(s);
}
