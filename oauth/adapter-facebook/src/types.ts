import type { ClientConfig } from "@webfx-oauth/client";

export interface FacebookClientConfig extends ClientConfig {
  readonly apiVersion?: string;
  readonly profileFields?: readonly string[];
}

export interface FacebookErrorResponse {
  readonly error: {
    readonly message: string;
    readonly type: "OAuthException";
    readonly code: number;
    readonly error_subcode: number;
  };
}

export interface FacebookProfileResponse {
  readonly id: string;
  readonly name: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly email?: string;
  readonly picture: {
    readonly data: {
      readonly url: string;
      readonly is_silhouette: boolean;
    };
  };
}
