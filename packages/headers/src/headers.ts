/**
 * Converts a header string value into a parsed object.
 */
export type HeaderParser<T> = (value: string) => T | null;

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

export type Parseable<T> = {
  readonly parse: HeaderParser<T>;
  readonly tryParse: HeaderParser<T>;
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
