import { Adapter } from "./adapter";
import { Session as SessionInterface } from "./types";

const kAdapter = Symbol();

export class Session implements SessionInterface {
  private readonly [kAdapter]: Adapter;

  constructor(adapter: Adapter) {
    this[kAdapter] = adapter;
  }

  get id(): string | null {
    return this[kAdapter].id;
  }

  get started(): boolean {
    return this.id != null;
  }

  get isNew(): boolean {
    this._assertStarted();
    return this[kAdapter].oldId == null;
  }

  get expires(): Date | null {
    this._assertStarted();
    const expires = this[kAdapter].expires;
    if (expires != null) {
      return new Date(expires * 1000);
    } else {
      return null;
    }
  }

  start(): void {
    this[kAdapter].start();
  }

  destroy(): void {
    this[kAdapter].destroy();
  }

  regenerate(): void {
    this[kAdapter].regenerate();
  }

  touch(): void {
    this._assertStarted();
    this[kAdapter].touch();
  }

  entries(): IterableIterator<[string, any]> {
    return this[kAdapter].data.entries();
  }

  has(key: string): boolean {
    return this[kAdapter].data.has(key);
  }

  get(key: string, defaultValue?: any): any | null {
    return this[kAdapter].data.get(key) ?? defaultValue ?? null;
  }

  pull(key: string, defaultValue?: any): any | null {
    const value = this[kAdapter].data.get(key) ?? defaultValue ?? null;
    this[kAdapter].data.delete(key);
    return value;
  }

  set(entries: { [key: string]: any }): void;
  set(key: string, value: any): void;
  set(...args: unknown[]): void {
    const { length } = args;
    if (length === 1 && typeof args[0] === "object" && args[0] != null) {
      for (const [key, value] of Object.entries(args[0])) {
        this._setImpl(key, value);
      }
      return;
    }
    if (length === 2 && typeof args[0] === "string") {
      const [key, value] = args;
      this._setImpl(key, value);
      return;
    }
    throw new TypeError();
  }

  private _setImpl(key: string, value: any): void {
    if (value == null) {
      this[kAdapter].data.delete(key);
    } else {
      this[kAdapter].data.set(key, value);
    }
  }

  delete(key: string): void {
    this[kAdapter].data.delete(key);
  }

  clear(): void {
    this[kAdapter].data.clear();
  }

  toJSON(): any {
    return Object.fromEntries(this[kAdapter].data);
  }

  private _assertStarted(): void {
    if (!this.started) {
      throw new Error("Session not started");
    }
  }
}
