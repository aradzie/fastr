/**
 * Splits the given input string into a pair of substring
 * on the first occurrence of the given separator.
 * @param input The input string.
 * @param separator The separator.
 */
export function splitPair(
  input: string,
  separator: string | number,
): readonly [string, string] {
  if (typeof separator === "string") {
    separator = separator.charCodeAt(0);
  }
  const { length } = input;
  let pos = 0;
  while (pos < length) {
    if (input.charCodeAt(pos) === separator) {
      const a = trimSubstring(input, 0, pos);
      const b = trimSubstring(input, pos + 1);
      return [a, b];
    }
    pos += 1;
  }
  return [trimSubstring(input, 0), ""];
}

/**
 * Splits the given input string into a list of substrings
 * on the all occurrences of the given separator.
 * Empty substrings are ignored.
 * @param input The input string.
 * @param separator The separator.
 */
export function splitList(
  input: string,
  separator: string | number,
): readonly string[] {
  if (typeof separator === "string") {
    separator = separator.charCodeAt(0);
  }
  const items: string[] = [];
  const { length } = input;
  let last = 0;
  let pos = 0;
  while (pos < length) {
    if (input.charCodeAt(pos) === separator) {
      if (pos > last) {
        const item = trimSubstring(input, last, pos);
        if (item.length > 0) {
          items.push(item);
        }
      }
      last = pos + 1;
    }
    pos += 1;
  }
  if (pos > last) {
    const item = trimSubstring(input, last, pos);
    if (item.length > 0) {
      items.push(item);
    }
  }
  return items;
}

/**
 * Splits the given input string into a list of lines
 * on the all new line separators such as "\n" and "\r".
 * Empty lines are ignored.
 * @param input The input string.
 */
export function splitLines(input: string): readonly string[] {
  const items: string[] = [];
  const { length } = input;
  let last = 0;
  let pos = 0;
  while (pos < length) {
    const ch = input.charCodeAt(pos);
    if (ch === 10 || ch === 13) {
      if (pos > last) {
        const item = trimSubstring(input, last, pos);
        if (item.length > 0) {
          items.push(item);
        }
      }
      last = pos + 1;
    }
    pos += 1;
  }
  if (pos > last) {
    const item = trimSubstring(input, last, pos);
    if (item.length > 0) {
      items.push(item);
    }
  }
  return items;
}

function trimSubstring(
  input: string,
  begin: number,
  end: number = input.length,
): string {
  while (begin < end) {
    const ch = input.charCodeAt(begin);
    if (ch === 32) {
      begin += 1;
    } else {
      break;
    }
  }
  while (end > begin) {
    const ch = input.charCodeAt(end - 1);
    if (ch === 32) {
      end -= 1;
    } else {
      break;
    }
  }
  return input.substring(begin, end);
}
