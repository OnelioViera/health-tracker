import mongoose from 'mongoose';

const DoctorVisitSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    required: true,
  },
  visitDate: {
    type: Date,
    required: true,
  },
  visitTime: {
    type: String,
    default: '9:00 AM',
  },
  visitType: {
    type: String,
    enum: ['checkup', 'consultation', 'emergency', 'follow-up', 'procedure', 'surgery'],
    default: 'checkup',
  },
  symptoms: [{
    type: String,
  }],
  diagnosis: {
    type: String,
  },
  treatment: {
    type: String,
  },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    notes: String,
  }],
  recommendations: [{
    type: String,
  }],
  followUpDate: {
    type: Date,
  },
  notes: {
    type: String,
    maxlength: 2000,
  },
  cost: {
    type: Number,
  },
  insurance: {
    type: String,
  },
  location: {
    type: String,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled',
  },
}, {
  timestamps: true,
});

export default mongoose.models.DoctorVisit || mongoose.model('DoctorVisit', DoctorVisitSchema); 