import mongoose from 'mongoose';

const BloodPressureSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  systolic: {
    type: Number,
    required: true,
    min: 70,
    max: 200,
  },
  diastolic: {
    type: Number,
    required: true,
    min: 40,
    max: 130,
  },
  pulse: {
    type: Number,
    min: 40,
    max: 200,
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
  category: {
    type: String,
    enum: ['normal', 'elevated', 'high', 'crisis'],
    default: 'normal',
  },
}, {
  timestamps: true,
});

// Calculate category based on blood pressure values
BloodPressureSchema.pre('save', function(next) {
  const systolic = this.systolic;
  const diastolic = this.diastolic;
  
  if (systolic < 120 && diastolic < 80) {
    this.category = 'normal';
  } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    this.category = 'elevated';
  } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    this.category = 'high';
  } else if (systolic >= 140 || diastolic >= 90) {
    this.category = 'crisis';
  }
  
  next();
});

export default mongoose.models.BloodPressure || mongoose.model('BloodPressure', BloodPressureSchema); 