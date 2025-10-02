// Post-related TypeScript interfaces

export interface AccountData {
  byokCredentials: {
    isActive: boolean;
  };
  _id: string;
  platform: string;
  profileId: string;
  __v: number;
  accessToken: string;
  createdAt: string;
  displayName: string;
  isActive: boolean;
  metadata: {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    refresh_token_expires_in: number;
    scope: string;
    token_type: string;
    id_token: string;
    profileData: {
      id: string;
      username: string;
      displayName: string;
      profilePicture: string | null;
      email: string;
    };
    connectedAt: string;
    userProfile: {
      id: string;
      username: string;
      displayName: string;
      profilePicture: string | null;
      email: string;
    };
    accountType: string;
  };
  permissions: string[];
  platformUserId: string;
  refreshToken: string;
  tokenExpiresAt: string;
  updatedAt: string;
  userId: string;
  username: string;
}

export interface PlatformPostData {
  platform: string;
  accountId: AccountData;
  customMedia: any[];
  platformSpecificData: {
    __platformUserIdSnapshot: string;
    __usernameSnapshot: string;
  };
  status: 'published' | 'scheduled' | 'failed';
  _id: string;
  platformPostId: string;
  platformPostUrl: string;
  publishedAt: string;
}

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  _id: string;
}

export interface PostAnalytics {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

export interface PostResponse {
  post: {
    analytics: PostAnalytics;
    _id: string;
    userId: string;
    title: string;
    content: string;
    mediaItems: MediaItem[];
    platforms: PlatformPostData[];
    scheduledFor: string;
    timezone: string;
    status: 'published' | 'scheduled' | 'failed';
    tags: string[];
    hashtags: string[];
    mentions: string[];
    visibility: 'public' | 'private';
    crosspostingEnabled: boolean;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  message: string;
}

export interface APIPostResponse {
  success: boolean;
  data?: PostResponse;
  error?: string;
  message?: string;
  // For backward compatibility, the response might directly contain post data
  post?: PostResponse['post'];
}

// Simplified interface for Success page display
export interface SuccessPagePostData {
  post: {
    content: string;
    platforms: Array<{
      platform: string;
      accountId: {
        displayName: string;
        username: string;
        platformUserId: string;
      };
      platformPostId: string;
      platformPostUrl: string;
      publishedAt: string;
      status: string;
    }>;
    status: string;
    publishedAt?: string;
    createdAt: string;
  };
  message: string;
}
