import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  category: {
    type: String,
    required: true,
    enum: ['weight', 'blood-pressure', 'nutrition', 'general'],
    default: 'general',
  },
  targetValue: {
    type: Number,
    required: true,
  },
  currentValue: {
    type: Number,
    required: true,
    default: 0,
  },
  unit: {
    type: String,
    required: true,
    maxlength: 20,
  },
  startDate: {
    type: Date,
    required: true,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'overdue'],
    default: 'active',
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema); 