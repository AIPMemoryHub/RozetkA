export function fnv1aHex(input) {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return ("00000000" + h.toString(16)).slice(-8) + ("00000000" + (~h >>> 0).toString(16)).slice(-8);
}

export function pseudoCIDFromJSON(json) {
  return "cid_" + fnv1aHex(json).slice(0, 32);
}

export const nowISO = () => new Date().toISOString().slice(0, 16).replace("T", " ");
