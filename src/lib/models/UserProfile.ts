import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'United States',
    },
  },
  phone: {
    type: String,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  insurance: {
    policyNumber: String,
    groupNumber: String,
  },
  medicalHistory: {
    conditions: [String],
    allergies: [String],
    medications: [String],
    surgeries: [String],
  },
  preferences: {
    healthDataSharing: {
      type: Boolean,
      default: false,
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: false,
      },
      reminders: {
        type: Boolean,
        default: true,
      },
    },
  },
}, {
  timestamps: true,
});

export default mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema); 