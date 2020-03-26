import { BadRequestError } from "@fastr/errors";
import { Forwarded } from "@fastr/headers";
import { type IncomingMessage } from "http";

export function getOrigin(
  message: IncomingMessage,
  behindProxy: boolean,
): string {
  const { socket, headers } = message;

  if (behindProxy) {
    const forwarded = headers["forwarded"];
    if (forwarded) {
      const { proto, host } = Forwarded.parse(forwarded);
      if (proto && host) {
        return `${proto}://${host}`;
      }
      if (proto || host) {
        throw new BadRequestError("Invalid Headers");
      }
    }

    // TODO Last entry in a comma separated list?
    const forwardedHost = headers["x-forwarded-host"];
    const forwardedProto = headers["x-forwarded-proto"];
    if (forwardedHost && forwardedProto) {
      return `${forwardedProto}://${forwardedHost}`;
    }
    if (forwardedHost || forwardedProto) {
      throw new BadRequestError("Invalid Headers");
    }
  }

  const host = headers["host"];
  if (host) {
    return "encrypted" in socket && socket.encrypted === true // TLSSocket
      ? `https://${host}`
      : `http://${host}`;
  }

  throw new BadRequestError("Invalid Headers");
}
