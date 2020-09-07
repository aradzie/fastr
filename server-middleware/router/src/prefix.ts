import { parse } from "./parser.js";
import { makePath, MatchedPathParams, matchPrefix, Segment } from "./path.js";

export class Prefix {
  /**
   * The prefix.
   */
  readonly prefix: string;
  /**
   * Segments obtained by parsing the prefix.
   */
  readonly segments: readonly Segment[];

  constructor(prefix: string) {
    if (prefix === "/") {
      throw new Error("Empty prefix");
    }
    if (!prefix.startsWith("/")) {
      throw new Error("Prefix does not start with the slash character");
    }
    if (!prefix.endsWith("/")) {
      throw new Error("Prefix does not end with the slash character");
    }
    this.prefix = prefix;
    this.segments = parse(prefix);
  }

  match(
    path: string,
    params: MatchedPathParams,
  ): {
    suffix: string;
    params: MatchedPathParams;
  } | null {
    return matchPrefix(this.segments, path, params);
  }

  /**
   * Generates path by replacing parameter placeholders with the given values.
   * @param params Parameters to replace placeholders in the path.
   */
  makePath(params: { [key: string]: any }): string {
    return makePath(this.segments, params);
  }
}
