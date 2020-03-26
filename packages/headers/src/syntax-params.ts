import { type Weighted } from "./accepted.js";
import { type Params } from "./params.js";
import { type Scanner, Separator } from "./syntax.js";

export function readParams(
  scanner: Scanner,
  params: Params,
  weighted: Weighted | null = null,
): boolean {
  // parameters      = *( OWS ";" OWS [ parameter ] )
  // parameter       = parameter-name "=" parameter-value
  // parameter-name  = token
  // parameter-value = ( token / quoted-string )
  // weight          = OWS ";" OWS "q=" qvalue
  // qvalue          = ( "0" [ "." 0*3DIGIT ] )
  //                 / ( "1" [ "." 0*3("0") ] )
  scanner.skipWs();
  while (scanner.readChar(Separator.Semicolon)) {
    scanner.skipWs();
    const name = scanner.readToken();
    if (name == null) {
      return false;
    }
    scanner.skipWs();
    if (!scanner.readChar(Separator.Equals)) {
      return false;
    }
    scanner.skipWs();
    if (weighted != null && (name === "q" || name === "Q")) {
      const value = scanner.readNumber();
      if (value == null || value > 1) {
        return false;
      }
      weighted.q = value;
    } else {
      const value = scanner.readTokenOrQuotedString();
      if (value == null) {
        return false;
      }
      params.set(name, value);
    }
    scanner.skipWs();
  }
  return true;
}
