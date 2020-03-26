import { type Container } from "@fastr/invert";
import { Cookies } from "./cookies.js";
import { type Request } from "./request.js";
import { type Response } from "./response.js";
import { type DefaultState } from "./state.js";

export class Context<StateT = unknown> {
  readonly #container: Container;
  readonly #request: Request;
  readonly #response: Response;
  readonly #state: DefaultState & StateT;
  #cookies?: Cookies;

  constructor(
    container: Container,
    request: Request,
    response: Response,
    state: DefaultState & StateT,
  ) {
    this.#container = container;
    this.#request = request;
    this.#response = response;
    this.#state = state;
  }

  get container(): Container {
    return this.#container;
  }

  get request(): Request {
    return this.#request;
  }

  get response(): Response {
    return this.#response;
  }

  get state(): DefaultState & StateT {
    return this.#state;
  }

  get cookies(): Cookies {
    return (this.#cookies ??= new Cookies(
      this.#request.headers,
      this.#response.headers,
      {
        secure: this.#request.protocol === "https",
      },
    ));
  }

  get [Symbol.toStringTag]() {
    return "Context";
  }
}
