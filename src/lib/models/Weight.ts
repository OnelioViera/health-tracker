import mongoose from 'mongoose';

const WeightSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  weight: {
    type: Number,
    required: true,
    min: 20,
    max: 500,
  },
  height: {
    type: Number,
    required: false, // Make height optional
    min: 30, // 30 inches minimum
    max: 100, // 100 inches maximum
  },
  unit: {
    type: String,
    enum: ['kg', 'lbs'],
    default: 'lbs',
  },
  heightUnit: {
    type: String,
    enum: ['cm', 'in'],
    default: 'in',
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Weight || mongoose.model('Weight', WeightSchema); 