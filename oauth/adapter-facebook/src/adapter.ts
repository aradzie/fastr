import { isClientError } from "@webfx-http/status";
import {
  AbstractAdapter,
  AccessToken,
  OAuthError,
  ResourceOwner,
} from "@webfx-oauth/client";
import {
  Adapter,
  HttpRequest,
  HttpResponse,
  Middleware,
} from "@webfx-request/node";
import { createHmac } from "crypto";
import type {
  FacebookClientConfig,
  FacebookErrorResponse,
  FacebookProfileResponse,
} from "./types";

// See https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/
// See https://developers.facebook.com/docs/graph-api/using-graph-api/error-handling

export class FacebookAdapter extends AbstractAdapter {
  constructor(config: FacebookClientConfig) {
    const {
      apiVersion = "v3.2",
      profileFields = [
        "id",
        "name",
        "first_name",
        "last_name",
        "email",
        "picture.type(large){url,is_silhouette}",
        "link",
        "locale",
      ],
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

  protected parseProfileResponse(
    response: FacebookProfileResponse,
  ): ResourceOwner<FacebookProfileResponse> {
    const { id, email, name } = response;
    return {
      raw: response,
      provider: "facebook",
      id: id,
      email: email ?? null,
      name: name,
      url: `https://www.facebook.com/${id}`,
      imageUrl: `https://graph.facebook.com/${id}/picture`,
    };
  }

  handleErrors(): Middleware {
    return (adapter: Adapter): Adapter => {
      return async (request: HttpRequest): Promise<HttpResponse> => {
        const response = await adapter(request);
        if (
          isClientError(response.status) &&
          response.headers.contentType()?.name === "application/json"
        ) {
          const body = await response.body.json<FacebookErrorResponse>();
          throw FacebookAdapter.translateError(body);
        }
        return response;
      };
    };
  }

  authenticateRequest({ token }: AccessToken): Middleware {
    const proof = createHmac("sha256", this.clientSecret)
      .update(token)
      .digest("hex");
    return (adapter: Adapter): Adapter => {
      return async (request: HttpRequest): Promise<HttpResponse> => {
        const url = new URL(request.url);
        url.searchParams.append("access_token", token);
        url.searchParams.append("appsecret_proof", proof);
        return adapter({
          ...request,
          url: String(url),
        });
      };
    };
  }

  /**
   * Example:
   *
   * ```json
   * { error:
   *   { message: 'Error validating application. Invalid application ID.',
   *     type: 'OAuthException',
   *     code: 101 } }
   * ```
   */
  static translateError(response: FacebookErrorResponse): Error {
    const {
      error: {
        type,
        code,
        error_subcode: subcode,
        message = "Unknown error",
      } = {},
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
          return new OAuthError("invalid_client", message, response);
        }

        if (subcode === 467) {
          // Name: Invalid Access Token
          // Access token has expired, been revoked,
          // or is otherwise invalid.
          return new OAuthError("invalid_grant", message, response);
        }

        return new OAuthError("invalid_grant", message, response);
      }

      if (code === 190) {
        // Name: Access token has expired
        return new OAuthError("invalid_grant", message, response);
      }

      return new OAuthError("invalid_request", message, response);
    } else {
      return new TypeError(
        `Unknown Facebook error, type=[${type}], ` +
          `code=[${code}], ` +
          `subcode=[${subcode}], ` +
          `message=[${message}]`,
      );
    }
  }
}
