import {
  createOAuth2AuthorizationUrl,
  OAuth2ProviderAuth,
  validateOAuth2AuthorizationCode,
} from "@lucia-auth/oauth/dist/core/oauth2";
import { ProviderUserAuth } from "@lucia-auth/oauth/dist/core/provider";
import {
  authorizationHeader,
  handleRequest,
} from "@lucia-auth/oauth/dist/utils/request";
import type { Auth } from "lucia";

interface Config {
  clientId: string;
  clientSecret: string;
  authentikUrl: string;
  scope?: string[];
  redirectUri: string;
}

const PROVIDER_ID = "authentik";

export const authentik = <_Auth extends Auth = Auth>(
  auth: _Auth,
  config: Config,
): AuthentikAuth<_Auth> => {
  return new AuthentikAuth(auth, config);
};

export class AuthentikAuth<
  _Auth extends Auth = Auth,
> extends OAuth2ProviderAuth<AuthentikUserAuth<_Auth>> {
  private config: Config;
  constructor(auth: _Auth, config: Config) {
    super(auth);
    this.config = config;
  }

  public getAuthorizationUrl = async (): Promise<
    readonly [url: URL, state: string]
  > => {
    const scopeConfig = this.config.scope ?? [];
    return await createOAuth2AuthorizationUrl(
      `${this.config.authentikUrl}/application/o/authorize/`,
      {
        clientId: this.config.clientId,
        scope: scopeConfig,
        redirectUri: this.config.redirectUri,
      },
    );
  };

  public validateCallback = async (
    code: string,
  ): Promise<AuthentikUserAuth<_Auth>> => {
    const authentikTokens = await this.validateAuthorizationCode(code);
    const authentikUser = await getAuthentikUser(
      authentikTokens.access_token,
      this.config.authentikUrl,
    );
    return new AuthentikUserAuth(this.auth, authentikUser, authentikTokens);
  };

  private validateAuthorizationCode = async (
    code: string,
  ): Promise<AuthentikTokens> => {
    const tokens = await validateOAuth2AuthorizationCode<AuthentikTokens>(
      code,
      `${this.config.authentikUrl}/application/o/token/`,
      {
        clientId: this.config.clientId,
        clientPassword: {
          clientSecret: this.config.clientSecret,
          authenticateWith: "client_secret",
        },
      },
    );
    return tokens;
  };
}

export class AuthentikUserAuth<
  _Auth extends Auth = Auth,
> extends ProviderUserAuth<_Auth> {
  public authentikTokens: AuthentikTokens;
  public authentikUser: AuthentikUser;

  constructor(
    auth: _Auth,
    authentikUser: AuthentikUser,
    authenticTokens: AuthentikTokens,
  ) {
    super(auth, PROVIDER_ID, authentikUser.email);
    this.authentikUser = authentikUser;
    this.authentikTokens = authenticTokens;
  }
}

const getAuthentikUser = async (
  accessToken: string,
  authentikUrl: string,
): Promise<AuthentikUser> => {
  const request = new Request(`${authentikUrl}/api/v2/userinfo`, {
    headers: {
      Authorization: authorizationHeader("bearer", accessToken),
    },
  });
  const authentikUser = await handleRequest<AuthentikUser>(request);
  return authentikUser;
};

export interface AuthentikTokens {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  id_token: string;
}

export interface AuthentikUser {
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  preferred_username: string;
  nickname: string;
  groups: string[];
  sub: string;
}
