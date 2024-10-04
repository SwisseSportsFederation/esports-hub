import type { SocialPlatform, EntityType, AccessRight, RequestStatus, VerificationLevel } from '@prisma/client';

export const SocialPlatformValue = {
  INSTAGRAM: 'INSTAGRAM',
  TWITCH: 'TWITCH',
  TWITTER: 'TWITTER',
  DISCORD: 'DISCORD',
  FACEBOOK: 'FACEBOOK',
  STEAM: 'STEAM',
  ORIGIN: 'ORIGIN',
  BATTLENET: 'BATTLENET',
  UPLAY: 'UPLAY',
  WEBSITE: 'WEBSITE',
  TIKTOK: 'TIKTOK',
  YOUTUBE: 'YOUTUBE',
} satisfies typeof SocialPlatform;

export const EntityTypeValue = {
  USER: 'USER',
  TEAM: 'TEAM',
  ORGANISATION: 'ORGANISATION',
} satisfies typeof EntityType;

export const AccessRightValue = {
  MEMBER: 'MEMBER',
  MODERATOR: 'MODERATOR',
  ADMINISTRATOR: 'ADMINISTRATOR',
} satisfies typeof AccessRight;

export const RequestStatusValue = {
  ACCEPTED: 'ACCEPTED',
  PENDING_USER: 'PENDING_USER',
  PENDING_GROUP: 'PENDING_GROUP',
  PENDING_PARENT_GROUP: 'PENDING_PARENT_GROUP',
} satisfies typeof RequestStatus;

export const VerificationLevelValue = {
  NOT_VERIFIED: 'NOT_VERIFIED',
  PRE_VERIFIED: 'PRE_VERIFIED',
  VERIFIED: 'VERIFIED',
} satisfies typeof VerificationLevel;
