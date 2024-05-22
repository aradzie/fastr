import { type IncomingMessage, type OutgoingMessage } from "node:http";
import { type IncomingHeaders, type OutgoingHeaders } from "@fastr/headers";

export class IncomingMessageHeaders implements IncomingHeaders {
  readonly #message: IncomingMessage;

  constructor(message: IncomingMessage) {
    this.#message = message;
  }

  names(): Iterable<string> {
    return Object.keys(this.#message.headers);
  }

  has(name: string): boolean {
    return this.#message.headers[name.toLowerCase()] != null;
  }

  get(name: string): string | null {
    const value = this.#message.headers[name.toLowerCase()];
    if (value == null) {
      return null;
    }
    if (Array.isArray(value)) {
      throw new TypeError(`Header ${name} is multi-valued.`);
    }
    return value;
  }

  getAll(name: string): readonly string[] | null {
    const value = this.#message.headers[name.toLowerCase()];
    if (value == null) {
      return null;
    }
    if (!Array.isArray(value)) {
      throw new TypeError(`Header ${name} is single-valued.`);
    }
    return value;
  }
}

export class OutgoingMessageHeaders implements OutgoingHeaders {
  readonly #message: OutgoingMessage;

  constructor(message: OutgoingMessage) {
    this.#message = message;
  }

  names(): Iterable<string> {
    return this.#message.getHeaderNames();
  }

  has(name: string): boolean {
    return this.#message.hasHeader(name);
  }

  get(name: string): string | null {
    const sep = getValueSeparator(name);
    if (sep == null) {
      throw new TypeError(`Header ${name} is multi-valued.`);
    }
    const value = this.#message.getHeader(name);
    if (value == null) {
      return null;
    }
    return Array.isArray(value)
      ? value.map((item) => String(item)).join(sep)
      : String(value);
  }

  getAll(name: string): readonly string[] | null {
    const sep = getValueSeparator(name);
    if (sep != null) {
      throw new TypeError(`Header ${name} is single-valued.`);
    }
    const value = this.#message.getHeader(name);
    if (value == null) {
      return null;
    }
    return Array.isArray(value)
      ? value.map((item) => String(item))
      : [String(value)];
  }

  map<T>(name: string, parser: (value: string) => T): T | null {
    const value = this.get(name);
    if (value == null) {
      return null;
    }
    return parser(value);
  }

  mapAll<T>(name: string, parser: (value: string) => T): readonly T[] | null {
    const value = this.getAll(name);
    if (value == null) {
      return null;
    }
    return value.map((item) => parser(item));
  }

  set(name: string, value: unknown | readonly unknown[]): void {
    if (Array.isArray(value)) {
      value = value.map((item) => String(item));
      const sep = getValueSeparator(name);
      if (sep != null) {
        value = (value as string[]).join(sep);
      }
    } else {
      value = String(value);
    }
    this.#message.setHeader(name, value as string | string[]);
  }

  append(name: string, value: unknown | readonly unknown[]): void {
    const oldValue = this.#message.getHeader(name);
    if (oldValue == null) {
      this.set(name, value);
    } else {
      const newValue = [];
      if (Array.isArray(oldValue)) {
        newValue.push(...oldValue);
      } else {
        newValue.push(oldValue);
      }
      if (Array.isArray(value)) {
        newValue.push(...value);
      } else {
        newValue.push(value);
      }
      this.set(name, newValue);
    }
  }

  delete(name: string): void {
    this.#message.removeHeader(name);
  }

  clear(): void {
    for (const name of this.#message.getHeaderNames()) {
      this.#message.removeHeader(name);
    }
  }
}

function getValueSeparator(name: string): string | null {
  if (
    name === "set-cookie" ||
    name === "Set-Cookie" ||
    (name.length === 10 && name.toLowerCase() === "set-cookie")
  ) {
    return null;
  }

  if (
    name === "cookie" ||
    name === "Cookie" ||
    (name.length === 6 && name.toLowerCase() === "cookie")
  ) {
    return "; ";
  }

  return ", ";
}
