// API Key Manager for Hiking Journal Integration
// This manages user-specific API keys in memory (for demo purposes)

interface UserApiKey {
  userId: string;
  hikingJournalApiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for demo purposes (in production, use a proper database)
const userApiKeys = new Map<string, UserApiKey>();

export function getUserApiKey(userId: string): string | null {
  const userKey = userApiKeys.get(userId);
  return userKey?.hikingJournalApiKey || null;
}

export function setUserApiKey(userId: string, apiKey: string): void {
  const now = new Date();
  userApiKeys.set(userId, {
    userId,
    hikingJournalApiKey: apiKey,
    createdAt: userApiKeys.get(userId)?.createdAt || now,
    updatedAt: now
  });
}

export function deleteUserApiKey(userId: string): void {
  userApiKeys.delete(userId);
}

export function hasUserApiKey(userId: string): boolean {
  return userApiKeys.has(userId);
}

export function getUserApiKeyInfo(userId: string): {
  hasApiKey: boolean;
  apiKeyMasked: string | null;
  lastUpdated: Date | null;
} {
  const userKey = userApiKeys.get(userId);
  const hasApiKey = !!userKey?.hikingJournalApiKey;
  
  return {
    hasApiKey,
    apiKeyMasked: hasApiKey ? `${userKey.hikingJournalApiKey.substring(0, 8)}...` : null,
    lastUpdated: userKey?.updatedAt || null
  };
} 