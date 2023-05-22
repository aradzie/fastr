export interface HeadersLike {
  get(name: string): string | null;
}

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
  getAll(name: string): readonly string[] | null;
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

export type Parseable<T> = {
  readonly parse: (value: string) => T;
  readonly tryParse: (value: string) => T | null;
};

export type HeaderClass<T extends Header> = {
  new (...args: any[]): T;
  readonly headerName: string;
  readonly headerNameLc: string;
} & Parseable<T>;

export const isHeaderClass = <T extends Header = any>(
  value: unknown,
): value is HeaderClass<T> => {
  return (
    typeof value === "function" &&
    typeof (value as HeaderClass<T>).headerName === "string" &&
    typeof (value as HeaderClass<T>).headerNameLc === "string"
  );
};

export const getHeader = <T extends Header>(
  header: HeaderClass<T>,
  headers: HeadersLike,
): T | null => {
  const value = headers.get(header.headerNameLc);
  if (value != null) {
    return header.parse(value);
  } else {
    return null;
  }
};

export const tryGetHeader = <T extends Header>(
  header: HeaderClass<T>,
  headers: HeadersLike,
): T | null => {
  const value = headers.get(header.headerNameLc);
  if (value != null) {
    return header.tryParse(value);
  } else {
    return null;
  }
};

export const parseOrThrow = <T extends Header>(
  parseable: Parseable<T>,
  input: string,
): T => {
  const header = parseable.tryParse(input);
  if (header == null) {
    throw new TypeError(`Invalid header value "${input}"`);
  }
  return header;
};
