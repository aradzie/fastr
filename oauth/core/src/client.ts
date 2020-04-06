import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { ClientError, ErrorResponse, OAuthError } from "./error";
import { AccessToken } from "./token";

export interface ClientCredentials {
  readonly clientId: string;
  readonly clientSecret: string;
}

export class Client implements ClientCredentials {
  readonly clientId: string;
  readonly clientSecret: string;

  constructor({ clientId, clientSecret }: ClientCredentials) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async request<T>(
    config: AxiosRequestConfig,
    accessToken: AccessToken | null = null,
  ): Promise<AxiosResponse<T>> {
    if (accessToken) {
      config = this.signRequest(config, accessToken);
    }
    try {
      return await axios.request<T>(config);
    } catch (error) {
      const { message, response } = error as AxiosError;
      if (typeof response === "object" && response != null) {
        const { data } = response as AxiosResponse;
        if (typeof data === "object" && data != null) {
          throw this.parseErrorResponse(data);
        }
      }
      throw new ClientError(message);
    }
  }

  protected signRequest(
    config: AxiosRequestConfig,
    { type, token }: AccessToken,
  ): AxiosRequestConfig {
    config.headers = {
      ...config.headers,
      Authorization: `${type} ${token}`,
    };
    return config;
  }

  protected parseErrorResponse(response: ErrorResponse | any): OAuthError {
    return new OAuthError(response.error_description || response.error);
  }
}
