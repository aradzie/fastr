/**
 * Path segment which does not have any parameters.
 *
 * This segment is matched literally.
 */
export type LiteralSegment = {
  readonly type: "literal";
  /**
   * Segment literal value, e.g. `"path"`;
   */
  readonly literal: string;
};

/**
 * Path segment which contains embedded parameter placeholders.
 *
 * This segment is matched using the contained regex pattern.
 */
export type PatternSegment = {
  readonly type: "pattern";
  /**
   * The unparsed literal value with parameter placeholders, e.g. `"icon-{name:[a-z]+}.png"`;
   */
  readonly literal: string;
  /**
   * The regex pattern created from the parsed literal, e.g. `"/^icon-(?<name>[a-z]+)\\.png$/"`.
   */
  readonly pattern: RegExp;
  /**
   * Path template with parameter placeholders used to construct paths, e.g. `"icon-{name}.png"`.
   */
  readonly template: string;
  /**
   * Parameter names, e.g. `["name"]`.
   */
  readonly names: readonly string[];
};

/**
 * Any segment.
 */
export type Segment = LiteralSegment | PatternSegment;

export function isLiteral(segment: Segment): segment is LiteralSegment {
  return segment.type === "literal";
}

export function isPattern(segment: Segment): segment is PatternSegment {
  return segment.type === "pattern";
}

export type MatchedPathParams = { [key: string]: string };

/**
 * Tests whether the given segment matches the given path fragment between slashes.
 *
 * In case of match updates the given parameters hash object with parameters collected
 * from the path fragment.
 */
export function matchFragment(
  segment: Segment,
  fragment: string,
  params: MatchedPathParams,
): boolean {
  switch (segment.type) {
    case "literal":
      {
        if (fragment === segment.literal) {
          return true;
        }
      }
      break;
    case "pattern":
      {
        segment.pattern.lastIndex = 0;
        const m = segment.pattern.exec(fragment);
        if (m != null) {
          const groups = m.groups!;
          for (const name of segment.names) {
            params[name] = groups[name];
          }
          return true;
        }
      }
      break;
  }
  return false;
}

/**
 * Tests whether the given segment list matches a prefix the given path.
 *
 * In case of match updates the given parameters hash object with parameters collected
 * from the matched path prefix.
 */
export function matchPrefix(
  segments: readonly Segment[],
  path: string,
  params: MatchedPathParams,
): {
  suffix: string;
  params: MatchedPathParams;
} | null {
  let pos = 1;
  let index = 0;
  for (const segment of segments) {
    if (pos === path.length) {
      return null;
    }
    let fragment: string;
    let i = path.indexOf("/", pos);
    if (i !== -1) {
      fragment = path.substring(pos, i + 1);
      pos = i + 1;
    } else {
      fragment = path.substring(pos);
      pos = path.length;
    }

    if (!matchFragment(segment, fragment, params)) {
      return null;
    }
    index++;
  }
  return { suffix: "/" + path.substring(pos), params };
}

/**
 * From the given segments generates path by replacing parameter placeholders
 * with the given values.
 */
export function makePath(
  segments: readonly Segment[],
  params: { readonly [key: string]: any },
): string {
  const parts: string[] = ["/"];
  for (const segment of segments) {
    let fragment;
    switch (segment.type) {
      case "literal":
        fragment = segment.literal;
        break;
      case "pattern":
        fragment = segment.template;
        for (const name of segment.names) {
          if (!(name in params)) {
            throw new Error(`Path param "${name}" is missing`);
          } else {
            const value = String(params[name]); // TODO Encode URI component?
            fragment = fragment.replace(`{${name}}`, value);
          }
        }
        break;
    }
    parts.push(fragment);
  }
  return parts.join("");
}
