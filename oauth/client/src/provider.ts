import { AxiosRequestConfig } from "axios";
import { Client } from "./client";
import type { ResourceOwner } from "./profile";
import { AccessToken } from "./token";
import type { ClientConfig, ProviderConfig, TokenResponse } from "./types";

export abstract class AbstractProvider {
  protected readonly clientId: string;
  protected readonly clientSecret: string;
  protected readonly scope: string;
  protected readonly redirectUri: string;
  protected readonly authorizationUri: string;
  protected readonly tokenUri: string;
  protected readonly profileUri: string;

  protected constructor(
    { clientId, clientSecret, scope, redirectUri }: ClientConfig,
    { authorizationUri, tokenUri, profileUri }: ProviderConfig,
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scope = scope;
    this.redirectUri = redirectUri;
    this.authorizationUri = authorizationUri;
    this.tokenUri = tokenUri;
    this.profileUri = profileUri;
  }

  newClient(): Client {
    return new Client({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    });
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
    const config: AxiosRequestConfig = {
      method: "post",
      url: this.tokenUri,
      data: {
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
      },
    };
    const { data } = await this.newClient().request<TokenResponse>(config);
    return new AccessToken(data);
  }

  async getProfile(accessToken: AccessToken): Promise<ResourceOwner> {
    const config: AxiosRequestConfig = {
      method: "get",
      url: this.profileUri,
    };
    const { data } = await this.newClient().request<{}>(config, accessToken);
    return this.parseProfileResponse(data);
  }

  protected abstract parseProfileResponse(response: {}): ResourceOwner;
}
