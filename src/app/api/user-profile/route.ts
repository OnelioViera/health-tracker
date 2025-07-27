import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import UserProfile from "@/lib/models/UserProfile";
import { mockUserProfileStorage } from "@/lib/mock-storage";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    
    // If using mock connection, return mock data
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      let mockUserProfile = mockUserProfileStorage.get();
      
      if (!mockUserProfile) {
        // Return default mock data if no profile exists
        mockUserProfile = {
          _id: 'mock_profile',
          userId,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          birthdate: null,
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States'
          },
          phone: '',
          emergencyContact: {
            name: '',
            relationship: '',
            phone: ''
          },
          insurance: {
            policyNumber: '',
            groupNumber: ''
          },
          medicalHistory: {
            conditions: [],
            allergies: [],
            medications: [],
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
      }
      
      return NextResponse.json(mockUserProfile);
    }

    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const db = await connectDB();
    
    // If using mock connection, return success without saving to DB
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      const mockUserProfile = {
        _id: `mock_${Date.now()}`,
        userId,
        firstName: body.firstName || user.firstName || '',
        lastName: body.lastName || user.lastName || '',
        email: body.email || user.primaryEmailAddress?.emailAddress || '',
        birthdate: body.birthdate ? new Date(body.birthdate) : null,
        address: body.address || {},
        phone: body.phone || '',
        emergencyContact: body.emergencyContact || {},
        insurance: body.insurance || {},
        medicalHistory: body.medicalHistory || {
          conditions: [],
          allergies: [],
          medications: [],
          surgeries: []
        },
        preferences: body.preferences || {
          healthDataSharing: false,
          notifications: {
            email: true,
            push: false,
            reminders: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save to mock storage
      mockUserProfileStorage.set(mockUserProfile);
      
      return NextResponse.json(mockUserProfile, { status: 201 });
    }

    // Check if user profile already exists
    let userProfile = await UserProfile.findOne({ userId });
    
    if (userProfile) {
      // Update existing profile
      userProfile.firstName = body.firstName || user.firstName || '';
      userProfile.lastName = body.lastName || user.lastName || '';
      userProfile.email = body.email || user.primaryEmailAddress?.emailAddress || '';
      userProfile.birthdate = body.birthdate ? new Date(body.birthdate) : null;
      userProfile.address = body.address || {};
      userProfile.phone = body.phone || '';
      userProfile.emergencyContact = body.emergencyContact || {};
      userProfile.insurance = body.insurance || {};
      userProfile.medicalHistory = body.medicalHistory || {
        conditions: [],
        allergies: [],
        medications: [],
        surgeries: []
      };
      userProfile.preferences = body.preferences || {
        healthDataSharing: false,
        notifications: {
          email: true,
          push: false,
          reminders: true
        }
      };
      userProfile.updatedAt = new Date();
      
      await userProfile.save();
    } else {
      // Create new profile
      userProfile = new UserProfile({
        userId,
        firstName: body.firstName || user.firstName || '',
        lastName: body.lastName || user.lastName || '',
        email: body.email || user.primaryEmailAddress?.emailAddress || '',
        birthdate: body.birthdate ? new Date(body.birthdate) : null,
        address: body.address || {},
        phone: body.phone || '',
        emergencyContact: body.emergencyContact || {},
        insurance: body.insurance || {},
        medicalHistory: body.medicalHistory || {
          conditions: [],
          allergies: [],
          medications: [],
          surgeries: []
        },
        preferences: body.preferences || {
          healthDataSharing: false,
          notifications: {
            email: true,
            push: false,
            reminders: true
          }
        }
      });
      
      await userProfile.save();
    }

    return NextResponse.json(userProfile, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to create/update user profile" },
      { status: 500 }
    );
  }
} 