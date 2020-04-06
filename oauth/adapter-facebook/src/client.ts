import { AccessToken, Client, OAuthError } from "@webfx-oauth/core";
import { AxiosRequestConfig } from "axios";
import crypto from "crypto";
import type { FacebookErrorResponse } from "./types";

/* eslint-disable @typescript-eslint/camelcase */

export class FacebookClient extends Client {
  protected signRequest(
    config: AxiosRequestConfig,
    { type, token }: AccessToken,
  ): AxiosRequestConfig {
    const proof = crypto
      .createHmac("sha256", this.clientSecret)
      .update(token)
      .digest("hex");
    config.params = {
      ...config.params,
      access_token: token,
      appsecret_proof: proof,
    };
    return config;
  }

  protected parseErrorResponse(response: FacebookErrorResponse): OAuthError {
    return new OAuthError(response.error.message);
  }
}
