import { type Adapter } from "./adapter.js";
import { type Session as SessionInterface } from "./types.js";

export class Session implements SessionInterface {
  readonly #adapter: Adapter;

  constructor(adapter: Adapter) {
    this.#adapter = adapter;
  }

  get id(): string | null {
    return this.#adapter.id;
  }

  get started(): boolean {
    return this.id != null;
  }

  get isNew(): boolean {
    this.#assertStarted();
    return this.#adapter.oldId == null;
  }

  get expires(): Date | null {
    this.#assertStarted();
    const expires = this.#adapter.expires;
    if (expires != null) {
      return new Date(expires * 1000);
    } else {
      return null;
    }
  }

  start(): void {
    this.#adapter.start();
  }

  destroy(): void {
    this.#adapter.destroy();
  }

  regenerate(): void {
    this.#adapter.regenerate();
  }

  touch(): void {
    this.#assertStarted();
    this.#adapter.touch();
  }

  entries(): IterableIterator<[string, any]> {
    return this.#adapter.data.entries();
  }

  has(key: string): boolean {
    return this.#adapter.data.has(key);
  }

  get(key: string, defaultValue?: any): any | null {
    return this.#adapter.data.get(key) ?? defaultValue ?? null;
  }

  pull(key: string, defaultValue?: any): any | null {
    const value = this.#adapter.data.get(key) ?? defaultValue ?? null;
    this.#adapter.data.delete(key);
    return value;
  }

  set(entries: { [key: string]: any }): void;
  set(key: string, value: any): void;
  set(...args: any[]): void {
    const { length } = args;
    if (length === 1 && typeof args[0] === "object" && args[0] != null) {
      for (const [key, value] of Object.entries(args[0])) {
        this.#set(key, value);
      }
      return;
    }
    if (length === 2 && typeof args[0] === "string") {
      this.#set(args[0], args[1]);
      return;
    }
    throw new TypeError();
  }

  #set(key: string, value: any): void {
    if (value == null) {
      this.#adapter.data.delete(key);
    } else {
      this.#adapter.data.set(key, value);
    }
  }

  delete(key: string): void {
    this.#adapter.data.delete(key);
  }

  clear(): void {
    this.#adapter.data.clear();
  }

  toJSON(): any {
    return Object.fromEntries(this.#adapter.data);
  }

  #assertStarted(): void {
    if (!this.started) {
      throw new Error("Session not started");
    }
  }
}
