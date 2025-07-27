import mongoose from 'mongoose';

const BloodWorkSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  testName: {
    type: String,
    required: true,
  },
  testDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  results: [{
    parameter: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    referenceRange: {
      min: Number,
      max: Number,
    },
    status: {
      type: String,
      enum: ['normal', 'low', 'high', 'critical'],
      default: 'normal',
    },
  }],
  labName: {
    type: String,
  },
  doctorName: {
    type: String,
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
  category: {
    type: String,
    enum: ['complete', 'basic', 'specialized', 'hormonal', 'other'],
    default: 'basic',
  },
}, {
  timestamps: true,
});

// Calculate status based on reference range
BloodWorkSchema.pre('save', function(next) {
  this.results.forEach(result => {
    if (result.referenceRange) {
      if (result.value < result.referenceRange.min) {
        result.status = 'low';
      } else if (result.value > result.referenceRange.max) {
        result.status = 'high';
      } else {
        result.status = 'normal';
      }
    }
  });
  next();
});

export default mongoose.models.BloodWork || mongoose.model('BloodWork', BloodWorkSchema); 