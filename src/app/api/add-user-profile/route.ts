import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserProfile from '@/lib/models/UserProfile';

export async function POST() {
  try {
    const db = await connectDB();
    
    if (db.connection?.readyState === 1 && process.env.MONGODB_URI?.startsWith('mongodb')) {
      const testUserId = 'test_user_123';
      
      // Check if user profile already exists
      const existingProfile = await UserProfile.findOne({ userId: testUserId });
      
      if (existingProfile) {
        return NextResponse.json({
          message: "User profile already exists",
          profile: {
            firstName: existingProfile.firstName,
            lastName: existingProfile.lastName,
            email: existingProfile.email
          }
        });
      }
      
      // Create user profile
      const userProfileData = {
        userId: testUserId,
        firstName: 'Onelio',
        lastName: 'Viera',
        email: 'onelio.viera@example.com',
        birthdate: new Date('1990-01-01'),
        address: {
          street: '123 Health Street',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          country: 'United States'
        },
        phone: '(305) 555-0123',
        emergencyContact: {
          name: 'Maria Viera',
          relationship: 'Spouse',
          phone: '(305) 555-0124'
        },
        insurance: {
          policyNumber: 'BCBS123456',
          groupNumber: 'GRP789'
        },
        medicalHistory: {
          conditions: ['Hypertension'],
          allergies: ['Penicillin'],
          medications: ['Lisinopril'],
          surgeries: []
        },
        preferences: {
          healthDataSharing: true,
          notifications: {
            email: true,
            push: false,
            reminders: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const newProfile = await UserProfile.create(userProfileData);
      
      return NextResponse.json({
        message: "User profile added successfully",
        profile: {
          firstName: newProfile.firstName,
          lastName: newProfile.lastName,
          email: newProfile.email
        }
      });
    } else {
      return NextResponse.json({
        message: "No database connection available"
      });
    }
  } catch (error) {
    console.error('Error adding user profile:', error);
    return NextResponse.json(
      { error: "Failed to add user profile" },
      { status: 500 }
    );
  }
} 