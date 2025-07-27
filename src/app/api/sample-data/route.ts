import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import BloodPressure from '@/lib/models/BloodPressure';
import BloodWork from '@/lib/models/BloodWork';
import DoctorVisit from '@/lib/models/DoctorVisit';
import Weight from '@/lib/models/Weight';
import UserProfile from '@/lib/models/UserProfile';

export async function GET() {
  // For testing purposes, allow GET without authentication
  try {
    const db = await connectDB();
    
    // Only add sample data if using real MongoDB
    if (db.connection?.readyState === 1 && process.env.MONGODB_URI?.startsWith('mongodb')) {
      // Use a default user ID for testing
      const testUserId = 'test_user_123';
      
      // Check if data already exists
      const existingData = await Promise.all([
        BloodPressure.countDocuments({ userId: testUserId }),
        BloodWork.countDocuments({ userId: testUserId }),
        DoctorVisit.countDocuments({ userId: testUserId }),
        Weight.countDocuments({ userId: testUserId }),
        UserProfile.countDocuments({ userId: testUserId })
      ]);

      if (existingData.some(count => count > 0)) {
        return NextResponse.json({
          message: "Sample data already exists",
          counts: {
            bloodPressure: existingData[0],
            bloodWork: existingData[1],
            doctorVisits: existingData[2],
            weight: existingData[3],
            userProfile: existingData[4]
          }
        });
      }

      // Create user profile first
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

      // Add sample blood pressure data
      const bloodPressureData = [
        {
          userId: testUserId,
          systolic: 120,
          diastolic: 80,
          pulse: 72,
          date: new Date(),
          notes: 'Morning reading - normal',
          category: 'normal',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: testUserId,
          systolic: 135,
          diastolic: 85,
          pulse: 78,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          notes: 'Evening reading - slightly elevated',
          category: 'high',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: testUserId,
          systolic: 118,
          diastolic: 78,
          pulse: 70,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          notes: 'Good control',
          category: 'normal',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      // Add sample blood work data
      const bloodWorkData = [
        {
          userId: testUserId,
          testName: 'Complete Blood Count (CBC)',
          testDate: new Date(),
          results: [
            {
              parameter: 'Hemoglobin',
              value: 14.2,
              unit: 'g/dL',
              referenceRange: { min: 12.0, max: 16.0 },
              status: 'normal',
            },
            {
              parameter: 'White Blood Cells',
              value: 7.5,
              unit: 'K/µL',
              referenceRange: { min: 4.5, max: 11.0 },
              status: 'normal',
            },
          ],
          labName: 'LabCorp',
          doctorName: 'Dr. Smith',
          notes: 'Routine checkup - all values normal',
          category: 'complete',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: testUserId,
          testName: 'Lipid Panel',
          testDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          results: [
            {
              parameter: 'Total Cholesterol',
              value: 180,
              unit: 'mg/dL',
              referenceRange: { min: 0, max: 200 },
              status: 'normal',
            },
            {
              parameter: 'HDL',
              value: 55,
              unit: 'mg/dL',
              referenceRange: { min: 40, max: 60 },
              status: 'normal',
            },
          ],
          labName: 'Quest Diagnostics',
          doctorName: 'Dr. Johnson',
          notes: 'Cholesterol levels good',
          category: 'lipid',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      // Add sample doctor visits data
      const doctorVisitsData = [
        {
          userId: testUserId,
          doctorName: 'Dr. Sarah Johnson',
          specialty: 'Primary Care',
          visitDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          visitTime: '10:00 AM',
          visitType: 'checkup',
          symptoms: ['Fatigue', 'Mild headache'],
          diagnosis: 'Common cold',
          treatment: 'Rest and fluids',
          medications: [
            {
              name: 'Acetaminophen',
              dosage: '500mg',
              frequency: 'Every 6 hours as needed',
              duration: '3 days',
              notes: 'For fever and pain',
            }
          ],
          recommendations: ['Get plenty of rest', 'Stay hydrated'],
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          notes: 'Annual physical examination',
          cost: 150,
          insurance: 'Blue Cross Blue Shield',
          location: 'Medical Center',
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: testUserId,
          doctorName: 'Dr. Michael Chen',
          specialty: 'Cardiology',
          visitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          visitTime: '2:30 PM',
          visitType: 'consultation',
          symptoms: ['Chest pain', 'Shortness of breath'],
          diagnosis: 'Anxiety-related symptoms',
          treatment: 'Stress management techniques',
          medications: [],
          recommendations: ['Practice deep breathing', 'Regular exercise'],
          followUpDate: null,
          notes: 'Cardiology consultation - no cardiac issues found',
          cost: 200,
          insurance: 'Blue Cross Blue Shield',
          location: 'Cardiology Clinic',
          status: 'completed',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      // Add sample weight data
      const weightData = [
        {
          userId: testUserId,
          weight: 165.0,
          height: 70,
          unit: 'lbs',
          heightUnit: 'in',
          date: new Date(),
          notes: 'Morning weight after workout',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: testUserId,
          weight: 165.5,
          height: 70,
          unit: 'lbs',
          heightUnit: 'in',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          notes: 'Evening weight - stable',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: testUserId,
          weight: 164.8,
          height: 70,
          unit: 'lbs',
          heightUnit: 'in',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          notes: 'Good weight maintenance',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      // Insert all sample data including user profile
      await Promise.all([
        UserProfile.create(userProfileData),
        BloodPressure.insertMany(bloodPressureData),
        BloodWork.insertMany(bloodWorkData),
        DoctorVisit.insertMany(doctorVisitsData),
        Weight.insertMany(weightData)
      ]);

      return NextResponse.json({
        message: "Sample health data and user profile added successfully",
        counts: {
          userProfile: 1,
          bloodPressure: bloodPressureData.length,
          bloodWork: bloodWorkData.length,
          doctorVisits: doctorVisitsData.length,
          weight: weightData.length
        },
        userProfile: userProfileData
      });
    } else {
      return NextResponse.json({
        message: "Using mock data - no database connection available",
        note: "Sample data will be created in mock storage for demonstration"
      });
    }
  } catch (error) {
    console.error('Error adding sample data:', error);
    return NextResponse.json(
      { error: "Failed to add sample data" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    
    // Only add sample data if using real MongoDB
    if (db.connection?.readyState === 1 && process.env.MONGODB_URI?.startsWith('mongodb')) {
      // Check if data already exists
      const existingData = await Promise.all([
        BloodPressure.countDocuments({ userId }),
        BloodWork.countDocuments({ userId }),
        DoctorVisit.countDocuments({ userId }),
        Weight.countDocuments({ userId })
      ]);

      if (existingData.some(count => count > 0)) {
        return NextResponse.json({
          message: "Sample data already exists",
          counts: {
            bloodPressure: existingData[0],
            bloodWork: existingData[1],
            doctorVisits: existingData[2],
            weight: existingData[3]
          }
        });
      }

      // Add sample blood pressure data
      const bloodPressureData = [
        {
          userId,
          systolic: 120,
          diastolic: 80,
          pulse: 72,
          date: new Date(),
          notes: 'Morning reading - normal',
          category: 'normal',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId,
          systolic: 135,
          diastolic: 85,
          pulse: 78,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          notes: 'Evening reading - slightly elevated',
          category: 'high',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId,
          systolic: 118,
          diastolic: 78,
          pulse: 70,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          notes: 'Good control',
          category: 'normal',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      // Add sample blood work data
      const bloodWorkData = [
        {
          userId,
          testName: 'Complete Blood Count (CBC)',
          testDate: new Date(),
          results: [
            {
              parameter: 'Hemoglobin',
              value: 14.2,
              unit: 'g/dL',
              referenceRange: { min: 12.0, max: 16.0 },
              status: 'normal',
            },
            {
              parameter: 'White Blood Cells',
              value: 7.5,
              unit: 'K/µL',
              referenceRange: { min: 4.5, max: 11.0 },
              status: 'normal',
            },
          ],
          labName: 'LabCorp',
          doctorName: 'Dr. Smith',
          notes: 'Routine checkup - all values normal',
          category: 'complete',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId,
          testName: 'Lipid Panel',
          testDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          results: [
            {
              parameter: 'Total Cholesterol',
              value: 180,
              unit: 'mg/dL',
              referenceRange: { min: 0, max: 200 },
              status: 'normal',
            },
            {
              parameter: 'HDL',
              value: 55,
              unit: 'mg/dL',
              referenceRange: { min: 40, max: 60 },
              status: 'normal',
            },
          ],
          labName: 'Quest Diagnostics',
          doctorName: 'Dr. Johnson',
          notes: 'Cholesterol levels good',
          category: 'lipid',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      // Add sample doctor visits data
      const doctorVisitsData = [
        {
          userId,
          doctorName: 'Dr. Sarah Johnson',
          specialty: 'Primary Care',
          visitDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          visitTime: '10:00 AM',
          visitType: 'checkup',
          symptoms: ['Fatigue', 'Mild headache'],
          diagnosis: 'Common cold',
          treatment: 'Rest and fluids',
          medications: [
            {
              name: 'Acetaminophen',
              dosage: '500mg',
              frequency: 'Every 6 hours as needed',
              duration: '3 days',
              notes: 'For fever and pain',
            }
          ],
          recommendations: ['Get plenty of rest', 'Stay hydrated'],
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          notes: 'Annual physical examination',
          cost: 150,
          insurance: 'Blue Cross Blue Shield',
          location: 'Medical Center',
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId,
          doctorName: 'Dr. Michael Chen',
          specialty: 'Cardiology',
          visitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          visitTime: '2:30 PM',
          visitType: 'consultation',
          symptoms: ['Chest pain', 'Shortness of breath'],
          diagnosis: 'Anxiety-related symptoms',
          treatment: 'Stress management techniques',
          medications: [],
          recommendations: ['Practice deep breathing', 'Regular exercise'],
          followUpDate: null,
          notes: 'Cardiology consultation - no cardiac issues found',
          cost: 200,
          insurance: 'Blue Cross Blue Shield',
          location: 'Cardiology Clinic',
          status: 'completed',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      // Add sample weight data
      const weightData = [
        {
          userId,
          weight: 165.0,
          height: 70,
          unit: 'lbs',
          heightUnit: 'in',
          date: new Date(),
          notes: 'Morning weight after workout',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId,
          weight: 165.5,
          height: 70,
          unit: 'lbs',
          heightUnit: 'in',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          notes: 'Evening weight - stable',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId,
          weight: 164.8,
          height: 70,
          unit: 'lbs',
          heightUnit: 'in',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          notes: 'Good weight maintenance',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      // Insert all sample data
      await Promise.all([
        BloodPressure.insertMany(bloodPressureData),
        BloodWork.insertMany(bloodWorkData),
        DoctorVisit.insertMany(doctorVisitsData),
        Weight.insertMany(weightData)
      ]);

      return NextResponse.json({
        message: "Sample health data added successfully",
        counts: {
          bloodPressure: bloodPressureData.length,
          bloodWork: bloodWorkData.length,
          doctorVisits: doctorVisitsData.length,
          weight: weightData.length
        }
      });
    } else {
      return NextResponse.json({
        message: "Using mock data - no database connection available",
        note: "Sample data will be created in mock storage for demonstration"
      });
    }
  } catch (error) {
    console.error('Error adding sample data:', error);
    return NextResponse.json(
      { error: "Failed to add sample data" },
      { status: 500 }
    );
  }
} 