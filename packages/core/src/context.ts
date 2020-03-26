import { type Container } from "@sosimple/inversify";
import { Cookies } from "./cookies.js";
import { type DefaultState } from "./middleware.js";
import { Request } from "./request.js";
import { Response } from "./response.js";

const kCookies = Symbol("kCookies");

export class Context<StateT = unknown> {
  private [kCookies]?: Cookies;

  constructor(
    readonly container: Container,
    readonly request: Request,
    readonly response: Response,
    readonly state: DefaultState & StateT,
  ) {
    container.bind(Context).toConstantValue(this);
    container.bind(Request).toConstantValue(this.request);
    container.bind(Response).toConstantValue(this.response);
  }

  get cookies(): Cookies {
    return (this[kCookies] ??= new Cookies(
      this.request.headers,
      this.response.headers,
      {
        secure: this.request.protocol === "https",
      },
    ));
  }

  get [Symbol.toStringTag]() {
    return "Context";
  }
}
