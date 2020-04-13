import { Body } from "@webfx-http/body";
import { Headers } from "@webfx-http/headers";
import { isSuccess } from "@webfx-http/status";
import http, { ClientRequest, IncomingMessage } from "http";
import https from "https";
import { sendBody } from "./body/send";
import type { HttpRequest, HttpResponse } from "./types";

export function requestAdapter(request: HttpRequest): Promise<HttpResponse> {
  const { url, body } = request;
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
    if (body != null) {
      sendBody(req, body, (err) => {
        if (err != null) {
          reject(err);
        }
      });
    } else {
      req.end();
    }
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
  incomingMessage: IncomingMessage,
): HttpResponse {
  const {
    statusCode: status = 200,
    statusMessage: statusText = "OK",
  } = incomingMessage;
  const ok = isSuccess(status);
  const headers = new Headers(incomingMessage.headers);
  const body = Body.from(incomingMessage);
  return new (class implements HttpResponse {
    readonly ok = ok;
    readonly status = status;
    readonly statusText = statusText;
    readonly url = String(request.url);
    readonly headers = headers;
    readonly body = body;

    abort(): void {
      incomingMessage.destroy();
    }
  })();
}
