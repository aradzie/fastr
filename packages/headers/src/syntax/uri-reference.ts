import { type Scanner, Separator } from "./syntax.js";

/**
 * @see https://httpwg.org/specs/rfc8288.html#rfc.section.3
 */
export function readUriReference(scanner: Scanner): string | null {
  const enum State {
    Init,
    LAngle,
    Uri,
    RAngle,
  }

  const start = scanner.pos;
  let state = State.Init as number;
  while (scanner.pos < scanner.length) {
    const ch = scanner.input.charCodeAt(scanner.pos);
    switch (state) {
      case State.Init:
        if (ch === Separator.LAngle) {
          state = State.LAngle;
          break;
        }
        return null;
      case State.LAngle:
        if (ch !== Separator.RAngle) {
          state = State.Uri;
          break;
        }
        return null;
      case State.Uri:
        if (ch === Separator.RAngle) {
          state = State.RAngle;
          break;
        }
        break;
    }
    scanner.pos += 1;
    if (state === State.RAngle) {
      return scanner.input.substring(start + 1, scanner.pos - 1);
    }
  }
  return null;
}
