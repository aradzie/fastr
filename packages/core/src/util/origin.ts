import { BadRequestError } from "@fastr/errors";
import { type IncomingMessage } from "http";

export function getOrigin(
  message: IncomingMessage,
  behindProxy: boolean,
): string {
  const { socket, headers } = message;

  if (behindProxy) {
    const proto = headers["x-forwarded-proto"];
    const host = headers["x-forwarded-host"];
    if (proto && host) {
      return `${proto}://${host}`;
    }
    if (proto || host) {
      throw new BadRequestError();
    }
  }

  const host = headers["host"] || headers[":authority"];
  if (host) {
    return "encrypted" in socket && socket.encrypted === true // TLSSocket
      ? `https://${host}`
      : `http://${host}`;
  }

  throw new BadRequestError();
}
