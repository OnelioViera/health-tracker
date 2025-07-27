import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarEvent extends Document {
  userId: string;
  title: string;
  type: 'appointment' | 'reminder' | 'test';
  date: string;
  time: string;
  doctor?: string;
  location?: string;
  status: 'upcoming' | 'completed';
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['appointment', 'reminder', 'test']
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  doctor: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['upcoming', 'completed'],
    default: 'upcoming'
  },
  color: {
    type: String,
    required: true,
    enum: ['blue', 'green', 'purple', 'orange', 'red'],
    default: 'blue'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
CalendarEventSchema.index({ userId: 1, date: 1 });
CalendarEventSchema.index({ userId: 1, status: 1 });

export default mongoose.models.CalendarEvent || mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema); 