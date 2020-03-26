import { type PatternSegment, type Segment } from "./path.js";

/**
 * Splits the given path with parameter placeholders into a list of parsed segments.
 */
export function parse(path: string): Segment[] {
  if (!path.startsWith("/")) {
    throw new Error("Path does not start with the slash character");
  }

  if (path === "/") {
    return [
      {
        type: "literal",
        literal: "/",
      },
    ];
  }

  const segments: Segment[] = [];

  let pos = 1; // Skip leading slash.
  let begin = 1;
  let pattern = "";
  let template = "";
  let names: string[] = [];
  while (pos < path.length) {
    if (eat(47 /* "/" */)) {
      pattern += "/";
      template += "/";
      push(path.substring(begin, pos));
      begin = pos;
      continue;
    }
    if (eat(123 /* "{" */)) {
      const s = pos;
      while (pos < path.length) {
        if (eat(125 /* "}" */)) {
          const [name, p] = parseParam(path.substring(s, pos - 1));
          pattern += `(?<${name}>${p})`;
          template += `{${name}}`;
          names.push(name);
          break;
        } else {
          pos++;
        }
      }
      continue;
    }
    const ch = path.charAt(pos);
    pattern += escapePattern(ch);
    template += ch;
    pos++;
  }
  if (begin < path.length) {
    push(path.substring(begin));
  }

  return segments;

  function push(literal: string): void {
    if (names.length > 0) {
      segments.push({
        type: "pattern",
        literal,
        pattern: new RegExp(`^${pattern}$`),
        template,
        names: [...names],
      } as PatternSegment);
    } else {
      segments.push({
        type: "literal",
        literal,
      });
    }
    pattern = "";
    template = "";
    names = [];
  }

  function eat(expected: number): boolean {
    const ch = path.charCodeAt(pos);
    if (ch === expected) {
      pos++;
      return true;
    } else {
      return false;
    }
  }
}

function parseParam(param: string): [string, string] {
  const i = param.indexOf(":");
  if (i !== -1) {
    const name = param.substring(0, i);
    const pattern = param.substring(i + 1);
    return [name, pattern];
  } else {
    return [param, "[^/]+"];
  }
}

function escapePattern(ch: string): string {
  switch (ch) {
    case ".":
    case "*":
    case "+":
    case "?":
    case "^":
    case "$":
    case "|":
    case "{":
    case "}":
    case "(":
    case ")":
    case "[":
    case "]":
    case "\\":
      return "\\" + ch;
    default:
      return ch;
  }
}
