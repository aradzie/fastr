import type { Adapter, HttpResponse, Middleware } from "./types";

export class RequestBuilder {
  constructor(
    readonly adapter: Adapter,
    readonly method: string,
    readonly url: URL | string,
  ) {}

  use(middleware: Middleware): this {
    return this;
  }

  send(): Promise<HttpResponse> {
    throw new Error("Not implemented");
  }

  sendForm(body: any): Promise<HttpResponse> {
    throw new Error("Not implemented");
  }

  sendJson(body: any): Promise<HttpResponse> {
    throw new Error("Not implemented");
  }
}
