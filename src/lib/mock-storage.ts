interface UserProfile {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  birthdate?: Date;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    policyNumber: string;
    groupNumber: string;
  };
  medicalHistory: {
    conditions: string[];
    allergies: string[];
    medications: string[];
    surgeries: string[];
  };
  preferences: {
    healthDataSharing: boolean;
    notifications: {
      email: boolean;
      push: boolean;
      reminders: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Shared mock storage for development/testing
export const mockUserProfileStorage = {
  get: () => mockUserProfile,
  set: (profile: UserProfile) => {
    mockUserProfile = profile;
  },
  clear: () => {
    mockUserProfile = null;
  }
};

// Mock user profile storage
let mockUserProfile: UserProfile | null = null; 