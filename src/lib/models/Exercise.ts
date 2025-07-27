import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  activityType: {
    type: String,
    required: true,
    enum: ['hiking', 'walking', 'running', 'cycling', 'swimming', 'gym', 'other'],
    default: 'hiking',
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  date: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  distance: {
    type: Number, // in miles or km
    required: false,
  },
  distanceUnit: {
    type: String,
    enum: ['miles', 'km'],
    default: 'miles',
  },
  calories: {
    type: Number,
    required: false,
  },
  heartRate: {
    average: Number,
    max: Number,
    min: Number,
  },
  elevation: {
    gain: Number, // in feet
    loss: Number, // in feet
  },
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  weather: {
    temperature: Number,
    conditions: String,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  photos: [{
    url: String,
    caption: String,
  }],
  tags: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'hard', 'extreme'],
    default: 'moderate',
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'tough', 'exhausted'],
    default: 'good',
  },
  source: {
    type: String,
    enum: ['hiking-journal', 'manual', 'fitness-tracker'],
    default: 'hiking-journal',
  },
  externalId: {
    type: String, // ID from hiking journal app
    required: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema); 