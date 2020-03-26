import { HttpHeaders } from "../headers.js";

export function parseHeaders(input: string): HttpHeaders {
  const headers = new HttpHeaders();

  for (const line of input.split(/[\r\n]+/)) {
    if (line.length > 0) {
      const colonPos = line.indexOf(":");
      let valuePos = colonPos + 1;
      while (valuePos < line.length && line.charCodeAt(valuePos) === 0x20) {
        valuePos += 1;
      }
      const name = line.substring(0, colonPos);
      const value = line.substring(valuePos);
      headers.append(name, value);
    }
  }

  return headers;
}
