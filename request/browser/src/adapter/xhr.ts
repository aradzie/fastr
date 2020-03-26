import { Headers as HttpHeaders } from "@webfx-http/headers";
import { RequestError } from "../errors";
import type { HttpResponse, ProgressListener } from "../types";
import { HttpRequest } from "../types";

export function xhrAdapter(request: HttpRequest): Promise<HttpResponse> {
  const sendListeners: ProgressListener[] = [];
  const receiveListeners: ProgressListener[] = [];
  const xhr = new XMLHttpRequest();
  xhr.open(request.method, String(request.url), true);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.responseType = "blob";
  xhr.upload.onprogress = (event: ProgressEvent): void => {
    if (event.lengthComputable) {
      for (const listener of sendListeners) {
        listener.step(event.total, event.loaded);
      }
    }
  };
  xhr.onprogress = (event: ProgressEvent): void => {
    if (event.lengthComputable) {
      for (const listener of receiveListeners) {
        listener.step(event.total, event.loaded);
      }
    }
  };

  return send(null);

  function send(body: any): Promise<HttpResponse> {
    return new Promise<HttpResponse>((resolve, reject) => {
      handleErrors(reject);
      xhr.onreadystatechange = (ev) => {
        if (xhr.readyState == XMLHttpRequest.HEADERS_RECEIVED) {
          const body = new Promise<Blob>((resolve, reject) => {
            handleErrors(reject);
            xhr.onload = (ev) => {
              resolve(xhr.response as Blob);
            };
          });
          resolve(makeResponse(xhr, body));
        }
        if (xhr.readyState == XMLHttpRequest.DONE) {
          notifyStopped();
        }
      };

      notifyStarted();
      xhr.send(body);
    });
  }

  function handleErrors(reject: (reason?: any) => void): void {
    xhr.onerror = (ev) => {
      reject(new RequestError("Unreachable"));
    };
    xhr.ontimeout = (ev) => {
      reject(new RequestError("Timeout"));
    };
    xhr.onabort = (ev) => {
      reject(new RequestError("Aborted"));
    };
  }

  function notifyStarted(): void {
    for (const listener of sendListeners) {
      listener.start();
    }
    for (const listener of receiveListeners) {
      listener.start();
    }
  }

  function notifyStopped(): void {
    for (const listener of sendListeners) {
      listener.stop();
    }
    for (const listener of receiveListeners) {
      listener.stop();
    }
  }
}

function makeResponse(xhr: XMLHttpRequest, body: Promise<Blob>): HttpResponse {
  const { status, statusText, responseURL: url } = xhr;
  const headers = HttpHeaders.parse(xhr.getAllResponseHeaders());
  const ok = status >= 200 && status < 300;
  let bodyUsed = false;

  return new (class XhrHttpResponse implements HttpResponse {
    ok = ok;
    status = status;
    statusText = statusText;
    url = url;
    headers = headers;

    async blob(): Promise<Blob> {
      return await readBody();
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
      return await readArrayBuffer();
    }

    async text(): Promise<any> {
      return await readText();
    }

    async json<T = unknown>(
      reviver?: (key: any, value: any) => any,
    ): Promise<T> {
      return JSON.parse(await readText(), reviver) as T;
    }

    abort(): void {
      bodyUsed = true;
      xhr.abort();
    }
  })();

  function readBody(): Promise<Blob> {
    if (bodyUsed) {
      throw new Error("Body has already been consumed");
    }
    bodyUsed = true;
    return body;
  }

  async function readArrayBuffer(): Promise<ArrayBuffer> {
    return readBlobAsArrayBuffer(await readBody());
  }

  async function readText(): Promise<string> {
    return readBlobAsText(await readBody());
  }
}

function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  const reader = new FileReader();
  const promise = promisifyFileReader<ArrayBuffer>(reader);
  reader.readAsArrayBuffer(blob);
  return promise;
}

function readBlobAsText(blob: Blob): Promise<string> {
  const reader = new FileReader();
  const promise = promisifyFileReader<string>(reader);
  reader.readAsText(blob);
  return promise;
}

function promisifyFileReader<T extends string | ArrayBuffer>(
  reader: FileReader,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.onload = () => {
      resolve(reader.result as T);
    };
  });
}
