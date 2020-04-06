export interface FacebookErrorResponse {
  readonly error: {
    readonly message: string;
    readonly type: "OAuthException";
    readonly code: number;
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
