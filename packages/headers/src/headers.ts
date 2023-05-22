import { InvalidHeaderError } from "./errors.js";

export interface GetHeader {
  get(name: string): string | null;
}

export interface GetAllHeaders {
  getAll(name: string): readonly string[] | null;
}

export interface IncomingHeaders extends GetHeader, GetAllHeaders {
  /**
   * Returns an array of names of headers. All names are lowercase.
   */
  names(): Iterable<string>;
  /**
   * Returns a value indicating whether a header with the given name is present.
   * The header name is case-insensitive.
   */
  has(name: string): boolean;
  /**
   * Returns a value of a header with the given name is present.
   * The header name is case-insensitive.
   */
  get(name: string): string | null;
  /**
   * Returns all values of a header with the given name is present.
   * The header name is case-insensitive.
   */
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

export type HeaderClass<T extends Header> = {
  new (...args: any[]): T;
  readonly headerName: string;
  readonly headerNameLc: string;
  readonly parse: (value: string) => T;
  readonly tryParse: (value: string) => T | null;
};

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
  headerClass: HeaderClass<T>,
  headers: GetHeader,
): T | null => {
  const header = headers.get(headerClass.headerNameLc);
  if (header != null) {
    return headerClass.parse(header);
  } else {
    return null;
  }
};

export const tryGetHeader = <T extends Header>(
  headerClass: HeaderClass<T>,
  headers: GetHeader,
): T | null => {
  const header = headers.get(headerClass.headerNameLc);
  if (header != null) {
    return headerClass.tryParse(header);
  } else {
    return null;
  }
};

export const parseOrThrow = <T extends Header>(
  headerClass: HeaderClass<T>,
  input: string,
): T => {
  const header = headerClass.tryParse(input);
  if (header != null) {
    return header;
  } else {
    throw new InvalidHeaderError(
      `Header "${headerClass.headerName}" has invalid value "${input}"`,
    );
  }
};
