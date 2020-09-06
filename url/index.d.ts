// See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/34960

export interface URL {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  readonly origin: string;
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  readonly searchParams: URLSearchParams;
  username: string;
  toString(): string;
  toJSON(): string;
}

export const URL: {
  prototype: URL;
  new (url: string, base?: string | URL): URL;
};

export interface URLSearchParams extends Iterable<[string, string]> {
  append(name: string, value: string): void;
  delete(name: string): void;
  entries(): IterableIterator<[string, string]>;
  forEach(
    callback: (value: string, name: string, searchParams: this) => void,
  ): void;
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  keys(): IterableIterator<string>;
  set(name: string, value: string): void;
  sort(): void;
  toString(): string;
  values(): IterableIterator<string>;
  [Symbol.iterator](): IterableIterator<[string, string]>;
}

export const URLSearchParams: {
  prototype: URLSearchParams;
  new (
    init?:
      | string
      | URLSearchParams
      | Iterable<[string, string]>
      | Array<[string, string]>,
  ): URLSearchParams;
  toString(): string;
};
