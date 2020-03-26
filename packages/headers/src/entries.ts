export type NameValueEntries =
  | Iterable<[string, unknown]>
  | Record<string, unknown>
  | readonly (readonly [string, string])[];

export function* entriesOf(
  entries: NameValueEntries | null,
): IterableIterator<[string, string]> {
  if (entries != null) {
    if (!(Symbol.iterator in entries || Array.isArray(entries))) {
      entries = Object.entries(entries);
    }

    for (const [name, value] of entries) {
      yield [name, String(value)];
    }
  }
}

export function* multiEntriesOf(
  entries: NameValueEntries | null,
): IterableIterator<[string, string]> {
  if (entries != null) {
    if (!(Symbol.iterator in entries || Array.isArray(entries))) {
      entries = Object.entries(entries);
    }

    for (const [name, value] of entries) {
      if (Array.isArray(value)) {
        for (const item of value) {
          yield [name, String(item)];
        }
      } else {
        yield [name, String(value)];
      }
    }
  }
}
