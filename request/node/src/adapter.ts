import { Body } from "@webfx-http/body";
import { Headers } from "@webfx-http/headers";
import { isSuccess } from "@webfx-http/status";
import { IncomingMessage, RequestOptions } from "http";
import { sendBody } from "./body/send";
import { selectTransport } from "./transport";
import type { HttpRequest, HttpResponse } from "./types";
import { toURL } from "./util";

export async function requestAdapter(
  request: HttpRequest,
): Promise<HttpResponse> {
  const url = toURL(request.url);
  const { method, headers, body, options = {} } = request;
  let { agent } = options;
  if (typeof agent === "function") {
    agent = agent(url);
  }
  const transport = selectTransport(url);
  const requestOptions: RequestOptions = {
    method: method.toUpperCase(),
    headers: headers?.toJSON(),
    agent: agent ?? false,
  };
  const res = await new Promise<IncomingMessage>((resolve, reject) => {
    const req = transport(url, requestOptions, (res) => {
      resolve(res);
    }).on("error", (err) => {
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
  return makeResponse(request, res);
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
  const headers = Headers.of(incomingMessage.headers);
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
