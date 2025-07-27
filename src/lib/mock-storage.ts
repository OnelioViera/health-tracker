// Shared mock storage for development/testing
export const mockUserProfileStorage = {
  get: () => mockUserProfile,
  set: (profile: any) => {
    mockUserProfile = profile;
  },
  clear: () => {
    mockUserProfile = null;
  }
};

// Mock user profile storage
let mockUserProfile: any = null; 