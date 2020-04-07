import type { TokenResponse } from "./types";

export class AccessToken {
  public readonly token: string;
  public readonly type: string;
  public readonly expiresAt: Date;

  constructor({ access_token, token_type, expires_in }: TokenResponse) {
    this.token = access_token;
    this.type = token_type;
    this.expiresAt = new Date(Date.now() + expires_in * 1000);
  }
}
