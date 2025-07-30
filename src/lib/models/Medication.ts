import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  timeOfDay: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
  },
  duration: {
    type: String,
    default: 'Ongoing',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'discontinued'],
    default: 'active',
  },
  category: {
    type: String,
    enum: ['prescription', 'over-the-counter', 'supplement', 'herbal'],
    default: 'prescription',
  },
  prescribedBy: {
    type: String,
  },
  pharmacy: {
    type: String,
  },
  refillDate: {
    type: Date,
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
  sideEffects: [{
    type: String,
  }],
  interactions: [{
    type: String,
  }],
  reminders: {
    enabled: {
      type: Boolean,
      default: false,
    },
    times: [{
      type: String, // "08:00", "12:00", "20:00"
    }],
    days: [{
      type: String, // "monday", "tuesday", etc.
    }],
  },
}, {
  timestamps: true,
});

export default mongoose.models.Medication || mongoose.model('Medication', MedicationSchema); 