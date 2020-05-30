import { UserMetadata } from './user-metadata';
import { UserInfo } from './user-info';

export type UserRecord = {
  uid: string;
  email?: string;
  emailVerified: boolean;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  disabled: boolean;
  metadata: UserMetadata;
  providerData: UserInfo[];
  passwordHash?: string;
  passwordSalt?: string;
  customClaims?: Object;
  tokensValidAfterTime?: string;
  tenantId?: string | null;
};
