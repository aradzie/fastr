import { isClientError } from "@webfx-http/status";
import {
  Adapter,
  authenticate,
  expectType,
  handleErrors,
  HttpRequest,
  HttpResponse,
  Middleware,
  request,
} from "@webfx-request/node";
import { OAuthError } from "./errors";
import type { ResourceOwner } from "./resource-owner";
import { AccessToken } from "./token";
import type { AdapterConfig, ClientConfig, ErrorResponse } from "./types";

export abstract class AbstractAdapter {
  protected readonly clientId: string;
  protected readonly clientSecret: string;
  protected readonly scope: string;
  protected readonly redirectUri: string;
  protected readonly authorizationUri: string;
  protected readonly tokenUri: string;
  protected readonly profileUri: string;

  protected constructor(
    { clientId, clientSecret, scope, redirectUri }: ClientConfig,
    { authorizationUri, tokenUri, profileUri }: AdapterConfig,
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scope = scope;
    this.redirectUri = redirectUri;
    this.authorizationUri = authorizationUri;
    this.tokenUri = tokenUri;
    this.profileUri = profileUri;
  }

  getAuthorizationUrl({ state }: { state: string }): string {
    const url = new URL(this.authorizationUri);
    for (const [key, value] of Object.entries({
      response_type: "code",
      client_id: this.clientId,
      scope: this.scope,
      redirect_uri: this.redirectUri,
      state,
    })) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
    return String(url);
  }

  async getAccessToken({ code }: { code: string }): Promise<AccessToken> {
    const response = await request
      .use(this.handleErrors())
      .use(handleErrors())
      .use(expectType("application/json"))
      .post(this.tokenUri)
      .send({
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
      });
    return new AccessToken(await response.body.json());
  }

  async getProfile(accessToken: AccessToken): Promise<ResourceOwner> {
    const response = await request
      .use(this.handleErrors())
      .use(handleErrors())
      .use(expectType("application/json"))
      .use(this.authenticate(accessToken))
      .get(this.profileUri)
      .send();
    return this.parseProfileResponse(await response.body.json());
  }

  protected abstract parseProfileResponse(response: unknown): ResourceOwner;

  authenticate({ type, token }: AccessToken): Middleware {
    return authenticate(`${type} ${token}`);
  }

  handleErrors(): Middleware {
    return (adapter: Adapter): Adapter => {
      return async (request: HttpRequest): Promise<HttpResponse> => {
        const response = await adapter(request);
        if (
          isClientError(response.status) &&
          response.headers.contentType()?.name === "application/json"
        ) {
          const body = await response.body.json<ErrorResponse>();
          throw OAuthError.from(body);
        }
        return response;
      };
    };
  }
}
