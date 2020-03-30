import http, { ClientRequest, IncomingMessage, RequestOptions } from "http";
import https from "https";

export function selectTransport(
  url: string,
): (
  url: string,
  options: RequestOptions,
  callback: (res: IncomingMessage) => void,
) => ClientRequest {
  if (url.startsWith("https:")) {
    return https.request;
  }
  if (url.startsWith("http:")) {
    return http.request;
  }
  throw new Error(`Invalid URL protocol [${url}]`);
}
