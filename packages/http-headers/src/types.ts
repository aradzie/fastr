export interface Header {
  toString(): string;
}

export interface HeadersLike {
  get(name: string): string | null;
  set(name: string, value: string): void;
  append(name: string, value: string): void;
}

export type NameValueEntries = readonly (readonly [
  name: string,
  value: unknown,
])[];
