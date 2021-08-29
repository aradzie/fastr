import { MediaType } from "@webfx-http/headers";
import { isClientError } from "@webfx-http/status";
import {
  AbstractAdapter,
  AccessToken,
  OAuthError,
  ResourceOwner,
} from "@webfx-oauth/client";
import type {
  Adapter,
  HttpRequest,
  HttpResponse,
  Middleware,
} from "@webfx-request/node";
import { createHmac } from "crypto";
import { URL } from "url";
import type {
  FacebookClientConfig,
  FacebookErrorResponse,
  FacebookProfileResponse,
} from "./types.js";

// See https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/
// See https://developers.facebook.com/docs/graph-api/using-graph-api/error-handling

export class FacebookAdapter extends AbstractAdapter {
  constructor(config: FacebookClientConfig) {
    const {
      apiVersion = "v3.2", //
      profileFields = ["id", "name", "email"], //
    } = config;
    const authorizationUri = `https://www.facebook.com/${apiVersion}/dialog/oauth`;
    const tokenUri = `https://graph.facebook.com/${apiVersion}/oauth/access_token`;
    const profileUri =
      `https://graph.facebook.com/${apiVersion}/me?fields=` +
      profileFields.join(",");
    super(config, {
      authorizationUri,
      tokenUri,
      profileUri,
    });
  }

  protected override parseProfileResponse(
    response: FacebookProfileResponse,
  ): ResourceOwner<FacebookProfileResponse> {
    const { id, name, email } = response;
    return {
      raw: response,
      provider: "facebook",
      id: id,
      name: name ?? "Unknown",
      url: `https://www.facebook.com/${id}`,
      imageUrl: `https://graph.facebook.com/${id}/picture`,
      email: email ?? null,
    };
  }

  override authenticate({ token }: AccessToken): Middleware {
    const proof = createHmac("sha256", this.clientSecret)
      .update(token)
      .digest("hex");
    return async (
      request: HttpRequest,
      adapter: Adapter,
    ): Promise<HttpResponse> => {
      const url = new URL(request.url);
      url.searchParams.set("access_token", token);
      url.searchParams.set("appsecret_proof", proof);
      return adapter({
        ...request,
        url: String(url),
      });
    };
  }

  override handleErrors(): Middleware {
    return async (
      request: HttpRequest,
      adapter: Adapter,
    ): Promise<HttpResponse> => {
      const response = await adapter(request);
      if (
        isClientError(response.status) &&
        response.headers.map("Content-Type", MediaType.parse)?.name ===
          "application/json"
      ) {
        const body = await response.body.json<FacebookErrorResponse>();
        throw FacebookAdapter.translateError(body);
      }
      return response;
    };
  }

  /**
   * Translates Facebook error response to [[OAuthError]].
   */
  static translateError(response: FacebookErrorResponse): Error {
    const {
      error: { message, type, code, error_subcode: subcode },
    } = response;
    if (type === "OAuthException") {
      if (code === 102) {
        // Name: API Session
        // If no subcode is present, the login status or access token
        // has expired, been revoked, or is otherwise invalid.
        // Get a new access token.
        // If a subcode is present, see the subcode.

        if (subcode === 458) {
          // Name: App Not Installed
          // The User has not logged into your app.
          // Reauthenticate the User.
          return new OAuthError(message, "invalid_client", response);
        }

        if (subcode === 467) {
          // Name: Invalid Access Token
          // Access token has expired, been revoked,
          // or is otherwise invalid.
          return new OAuthError(message, "invalid_request", response);
        }

        return new OAuthError(message, "invalid_request", response);
      }

      if (code === 190) {
        // Name: Access token has expired
        return new OAuthError(message, "invalid_request", response);
      }

      // We don't know how to translate this error exactly.
      return new OAuthError(message, "invalid_request", response);
    } else {
      return new TypeError(
        `Unknown Facebook error, ` +
          `type=[${type}], ` +
          `code=[${code}], ` +
          `subcode=[${subcode}], ` +
          `message=[${message}]`,
      );
    }
  }
}
