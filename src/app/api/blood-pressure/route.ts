import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import BloodPressure from "@/lib/models/BloodPressure";

// In-memory storage for mock data
const mockBloodPressureData: Array<{
  _id: string;
  userId: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  date: Date;
  notes: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}> = [
  {
    _id: 'mock_1',
    userId: 'user_123',
    systolic: 120,
    diastolic: 80,
    pulse: 72,
    date: new Date(),
    notes: 'Morning reading',
    category: 'normal', // 120/80 is normal
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'mock_2',
    userId: 'user_123',
    systolic: 135,
    diastolic: 85,
    pulse: 78,
    date: new Date(Date.now() - 86400000), // 1 day ago
    notes: 'Evening reading',
    category: 'high', // 135/85 is high
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if MongoDB is configured
    const db = await connectDB();
    
    // If using mock connection, return success without saving to DB
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      // Calculate category based on blood pressure values (same logic as the model)
      let category = 'normal';
      const systolic = body.systolic;
      const diastolic = body.diastolic;
      
      if (systolic < 120 && diastolic < 80) {
        category = 'normal';
      } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
        category = 'elevated';
      } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
        category = 'high';
      } else if (systolic >= 140 || diastolic >= 90) {
        category = 'crisis';
      }
      
      const mockBloodPressure = {
        _id: `mock_${Date.now()}`,
        userId,
        systolic: body.systolic,
        diastolic: body.diastolic,
        pulse: body.pulse,
        date: body.date,
        notes: body.notes,
        category: category,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Add to mock data storage
      mockBloodPressureData.unshift(mockBloodPressure); // Add to beginning of array
      
      return NextResponse.json(mockBloodPressure, { status: 201 });
    }

    const bloodPressure = new BloodPressure({
      userId,
      systolic: body.systolic,
      diastolic: body.diastolic,
      pulse: body.pulse,
      date: body.date,
      notes: body.notes,
    });

    await bloodPressure.save();

    return NextResponse.json(bloodPressure, { status: 201 });
  } catch (error) {
    console.error("Error creating blood pressure record:", error);
    return NextResponse.json(
      { error: "Failed to create blood pressure record" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    
    // If using mock connection, return mock data
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      // Filter mock data by userId and sort by date (newest first)
      const userMockData = mockBloodPressureData
        .filter(item => item.userId === userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return NextResponse.json({
        data: userMockData,
        pagination: {
          page: 1,
          limit: 10,
          total: userMockData.length,
          pages: 1,
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    const bloodPressures = await BloodPressure.find({ userId })
      .sort({ date: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await BloodPressure.countDocuments({ userId });

    return NextResponse.json({
      data: bloodPressures,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blood pressure records:", error);
    return NextResponse.json(
      { error: "Failed to fetch blood pressure records" },
      { status: 500 }
    );
  }
} 