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
      // Blood pressure specific notification settings
      bloodPressure: {
        pushNotifications: {
          type: Boolean,
          default: true,
        },
        emailNotifications: {
          type: Boolean,
          default: true,
        },
        smsNotifications: {
          type: Boolean,
          default: false,
        },
        quietHours: {
          type: Boolean,
          default: false,
        },
        quietHoursStart: {
          type: String,
          default: '10:00 PM',
        },
        quietHoursEnd: {
          type: String,
          default: '8:00 AM',
        },
      },
    },
    // PDF preferences for prescription downloads
    pdfPreferences: {
      patientName: {
        type: String,
        default: '',
      },
      patientInfo: {
        dateOfBirth: {
          type: String,
          default: '',
        },
        address: {
          type: String,
          default: '',
        },
        phone: {
          type: String,
          default: '',
        },
        email: {
          type: String,
          default: '',
        },
      },
      doctorInfo: {
        name: {
          type: String,
          default: '',
        },
        license: {
          type: String,
          default: '',
        },
        specialty: {
          type: String,
          default: '',
        },
        phone: {
          type: String,
          default: '',
        },
        address: {
          type: String,
          default: '',
        },
      },
      pharmacyInfo: {
        name: {
          type: String,
          default: '',
        },
        address: {
          type: String,
          default: '',
        },
        phone: {
          type: String,
          default: '',
        },
      },
      includeActiveOnly: {
        type: Boolean,
        default: true,
      },
      includeNotes: {
        type: Boolean,
        default: true,
      },
      includeSideEffects: {
        type: Boolean,
        default: true,
      },
      includeInteractions: {
        type: Boolean,
        default: true,
      },
    },
  },
}, {
  timestamps: true,
});

export default mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema); 