export interface MastodonCredentials {
  accessToken: string;
  userInstance: string;
}

export interface MastodonAccount {
  id: string;
  username: string;
  acct: string;
  url: string;
}

export interface MastodonFollowResult {
  success: boolean;
  error?: string;
  accountId?: string;
}

export interface MastodonTarget {
  username: string;
  instance: string;
  id?: string;
}

export interface MastodonBatchFollowResult {
  success: boolean;
  error?: string;
  results: Array<{
    target: MastodonTarget;
    success: boolean;
    error?: string;
  }>;
}

export interface IMastodonService {
  followAccount(
    accessToken: string,
    userInstance: string,
    targetUsername: string,
    targetInstance: string,
    targetId?: string
  ): Promise<MastodonFollowResult>;
  
  batchFollow(
    accessToken: string,
    userInstance: string,
    targets: Array<MastodonTarget>
  ): Promise<MastodonBatchFollowResult>;
}