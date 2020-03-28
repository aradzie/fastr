import { MimeType } from "./mimetype";
import { splitList } from "./strings";
import type { StringOr } from "./types";

export class Accept {
  static from(value: Accept | string): Accept {
    if (typeof value === "string") {
      return Accept.parse(value);
    } else {
      return value;
    }
  }

  /**
   * Creates a new instance of `Accept` by parsing the given header string.
   */
  static parse(input: string): Accept {
    return new Accept(splitList(input, ","));
  }

  static readonly ANY = new Accept([MimeType.ANY]);

  readonly types: readonly MimeType[];

  constructor(types: readonly StringOr<MimeType>[]) {
    // Sort the given types in the descending order
    // compared by the `q` parameter.
    this.types = types
      .map((v) => MimeType.from(v))
      .sort((a, b) => (b?.parameters?.q ?? 1) - (a?.parameters?.q ?? 1));
  }

  /**
   * Tests whether the specified media type is accepted.
   * @param candidate A candidate media type.
   * @return Whether the candidate media type is accepted.
   */
  accepts(candidate: StringOr<MimeType>): boolean | number {
    candidate = MimeType.from(candidate);
    if (this.types.length === 0) {
      return true;
    }
    for (const type of this.types) {
      if (type.matches(candidate)) {
        return type?.parameters?.q ?? true;
      }
    }
    return false;
  }

  /**
   * From the given list of candidate media types returns the one which
   * matches best, or `null` if no candidate matched.
   * @param candidates A list of candidate media types to chose from.
   * @return The best matching candidate, or `null` if none matches.
   */
  select(...candidates: readonly StringOr<MimeType>[]): MimeType | null {
    let best: MimeType | null = null;
    let bq = 0;
    for (let candidate of candidates) {
      candidate = MimeType.from(candidate);
      const q = this.accepts(candidate);
      if (q === true || q > bq) {
        best = candidate;
        bq = Number(q);
      }
    }
    return best;
  }

  toJSON(): any {
    return this.toString();
  }

  toString(): string {
    return this.types.map((type) => String(type)).join(", ");
  }
}
