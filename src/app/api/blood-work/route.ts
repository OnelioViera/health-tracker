import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import BloodWork from "@/lib/models/BloodWork";

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
      const mockBloodWork = {
        _id: `mock_${Date.now()}`,
        userId,
        testName: body.testName,
        testDate: body.testDate,
        results: body.results,
        labName: body.labName,
        doctorName: body.doctorName,
        notes: body.notes,
        category: body.category,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return NextResponse.json(mockBloodWork, { status: 201 });
    }

    const bloodWork = new BloodWork({
      userId,
      testName: body.testName,
      testDate: body.testDate,
      results: body.results,
      labName: body.labName,
      doctorName: body.doctorName,
      notes: body.notes,
      category: body.category,
    });

    await bloodWork.save();

    return NextResponse.json(bloodWork, { status: 201 });
  } catch (error) {
    console.error("Error creating blood work record:", error);
    return NextResponse.json(
      { error: "Failed to create blood work record" },
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
      const mockData = [
        {
          _id: 'mock_1',
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
          notes: 'Routine checkup',
          category: 'complete',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
      
      return NextResponse.json({
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: mockData.length,
          pages: 1,
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    const bloodWork = await BloodWork.find({ userId })
      .sort({ testDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await BloodWork.countDocuments({ userId });

    return NextResponse.json({
      data: bloodWork,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blood work records:", error);
    return NextResponse.json(
      { error: "Failed to fetch blood work records" },
      { status: 500 }
    );
  }
} 