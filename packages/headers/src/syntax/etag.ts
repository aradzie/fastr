import { type Scanner } from "./syntax.js";

/**
 * @see https://httpwg.org/specs/rfc9110.html#field.etag
 */
export function readETag(scanner: Scanner): string | null {
  // ETag       = entity-tag
  // entity-tag = [ weak ] opaque-tag
  // weak       = %s"W/"
  // opaque-tag = DQUOTE *etagc DQUOTE
  // etagc      = %x21 / %x23-7E / obs-text
  //            ; VCHAR except double quotes, plus obs-text
  // obs-text       = %x80-FF
  const enum State {
    Init,
    Weak_W,
    Weak_Slash,
    Value_Start,
    Value_Body,
    Value_End,
  }

  const start = scanner.pos;
  let state = State.Init as number;
  while (scanner.pos < scanner.length) {
    const ch = scanner.input.charCodeAt(scanner.pos);
    switch (state) {
      case State.Init:
        if (ch === /* "W" */ 0x57) {
          state = State.Weak_W;
          break;
        }
        if (ch === /* "\"" */ 0x22) {
          state = State.Value_Start;
          break;
        }
        return null;
      case State.Weak_W:
        if (ch === /* "/" */ 0x2f) {
          state = State.Weak_Slash;
          break;
        }
        return null;
      case State.Weak_Slash:
        if (ch === /* "\"" */ 0x22) {
          state = State.Value_Start;
          break;
        }
        return null;
      case State.Value_Start:
      case State.Value_Body:
        if (ch === 0x21 || (ch >= 0x23 && ch <= 0xff)) {
          state = State.Value_Body;
          break;
        }
        if (ch === /* "\"" */ 0x22) {
          state = State.Value_End;
          break;
        }
        return null;
    }
    scanner.pos += 1;
    if (state === State.Value_End) {
      return scanner.input.substring(start, scanner.pos);
    }
  }
  return null;
}
