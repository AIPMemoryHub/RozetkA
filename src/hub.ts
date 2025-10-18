import { defaultPolicy } from "./core/types.js";
import { MemoryHub } from "./core/store.js";
export const hub = new MemoryHub(defaultPolicy);
