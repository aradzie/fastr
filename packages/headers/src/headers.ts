export interface IncomingHeaders {
  /**
   * Returns an array of names of headers. All names are lowercase.
   */
  names(): Iterable<string>;

  /**
   * Returns a value indicating whether a header with the given name is present.
   * The header name is case-insensitive.
   */
  has(name: string): boolean;

  get(name: string): string | null;

  map<T>(name: string, parser: (value: string) => T): T | null;

  getAll(name: string): readonly string[] | null;

  mapAll<T>(name: string, parser: (value: string) => T): readonly T[] | null;
}

export interface OutgoingHeaders extends IncomingHeaders {
  set(name: string, value: unknown | readonly unknown[]): void;

  append(name: string, value: unknown | readonly unknown[]): void;

  delete(name: string): void;

  clear(): void;
}

export interface Header {
  toString(): string;
  readonly [Symbol.toStringTag]: string;
}

export type HeaderClass<T extends Header> = {
  new (...args: any[]): T;
  tryParse(input: string): T | null;
};

export function parseOrThrow<T extends Header>(
  headerClass: HeaderClass<T>,
  input: string,
): T {
  const header = headerClass.tryParse(input);
  if (header == null) {
    throw new TypeError(`Invalid header value "${input}"`);
  }
  return header;
}
