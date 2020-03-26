import { type Store } from "./store.js";
import { type SessionOptions } from "./types.js";
import { decode, encode, randomString } from "./util.js";

export interface ParsedOptions {
  readonly store: Store | "cookie";
  readonly generateId: () => string;
  readonly encode: (value: any) => string;
  readonly decode: (value: string) => any;
  readonly autoStart: boolean;
  readonly key: string;
  readonly rolling: boolean;
  readonly maxAge: number | "session";
  readonly domain?: string;
  readonly path?: string;
  readonly httpOnly?: boolean;
  readonly secure?: boolean;
  readonly sameSite?: "Strict" | "Lax" | "None" | null;
}

export function parseOptions(options: SessionOptions): ParsedOptions {
  return {
    store: "cookie",
    generateId: () => randomString(20),
    encode: encode,
    decode: decode,
    autoStart: false,
    key: "session",
    rolling: true,
    maxAge: 86400, // One day in seconds.
    ...options,
  };
}
