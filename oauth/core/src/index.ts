import axios from "axios";

export { OAuthError, ClientError, ErrorCode, ErrorResponse } from "./error";
export { AccessToken } from "./token";
export { Client, ClientCredentials } from "./client";
export {
  ClientConfig,
  ProviderConfig,
  TokenResponse,
  AbstractProvider,
} from "./provider";
export { ResourceOwner } from "./profile";

// Re-export axios so that all related modules share the same instance.
// This allows mocking in tests.
export { axios };
