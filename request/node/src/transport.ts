import http, { ClientRequest, IncomingMessage, RequestOptions } from "http";
import https from "https";
import { URL } from "url";

export function selectTransport(
  url: URL,
): (
  url: URL,
  options: RequestOptions,
  callback: (res: IncomingMessage) => void,
) => ClientRequest {
  switch (url.protocol) {
    case "https:":
      return https.request;
    case "http:":
      return http.request;
    default:
      throw new Error(`Invalid protocol [${url.protocol}]`);
  }
}
