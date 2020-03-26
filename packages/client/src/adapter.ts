import { Body, sendBody } from "@fastr/body";
import { isSuccess } from "@fastr/status";
import http, { type ClientRequest, type IncomingMessage } from "http";
import https from "https";
import { HttpHeaders } from "./headers.js";
import { type HttpRequest, type HttpResponse } from "./types.js";

export function requestAdapter(request: HttpRequest): Promise<HttpResponse> {
  const { url, body = null } = request;
  const transport = selectTransport(url);
  const options = makeOptions(request);
  return new Promise<HttpResponse>((resolve, reject) => {
    const req = transport(url, options, (res) => {
      try {
        resolve(makeResponse(request, res));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", (err) => {
      reject(err);
    });
    if (req.getHeader("Accept") == null) {
      req.setHeader("Accept", "*/*");
    }
    if (req.getHeader("Accept-Encoding") == null) {
      req.setHeader("Accept-Encoding", Body.acceptsEncoding.join(", "));
    }
    sendBody(req, body);
  });
}

function selectTransport(
  url: string,
): (
  url: string,
  options: http.RequestOptions & https.RequestOptions,
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

function makeOptions(
  request: HttpRequest,
): http.RequestOptions & https.RequestOptions {
  const { method, url, headers, options } = request;
  let { agent } = options ?? {};
  if (typeof agent === "function") {
    agent = agent(url);
  }
  return {
    ...options,
    method: method.toUpperCase(),
    headers: headers?.toJSON(),
    agent: agent ?? false,
  };
}

function makeResponse(
  request: HttpRequest,
  message: IncomingMessage,
): HttpResponse {
  const {
    statusCode: status = 200, //
    statusMessage: statusText = "OK", //
  } = message;
  const ok = isSuccess(status);
  const headers = new HttpHeaders(message.headers);
  const body = Body.from(message);
  return new (class implements HttpResponse {
    readonly ok = ok;
    readonly status = status;
    readonly statusText = statusText;
    readonly url = String(request.url);
    readonly headers = headers;
    readonly body = body;
    abort(): void {
      message.destroy();
    }
  })();
}
