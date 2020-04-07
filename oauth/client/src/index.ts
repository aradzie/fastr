import axios from "axios";

export type {
  ClientConfig,
  ClientCredentials,
  ErrorCode,
  ErrorResponse,
  ProviderConfig,
  TokenResponse,
} from "./types";
export type { ResourceOwner } from "./profile";
export { OAuthError, ClientError } from "./error";
export { AccessToken } from "./token";
export { Client } from "./client";
export { AbstractProvider } from "./provider";

// Re-export axios so that all related modules share the same instance.
// This allows mocking in tests.
export { axios };
