import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Weight from "@/lib/models/Weight";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.weight) {
      return NextResponse.json(
        { error: "Weight is required" },
        { status: 400 }
      );
    }

    // Validate numeric values
    const weight = parseFloat(body.weight);
    
    if (isNaN(weight)) {
      return NextResponse.json(
        { error: "Weight must be a valid number" },
        { status: 400 }
      );
    }

    // Validate weight range
    if (weight < 20 || weight > 500) {
      return NextResponse.json(
        { error: "Weight must be between 20 and 500" },
        { status: 400 }
      );
    }

    // Validate height if provided
    let height = null;
    if (body.height) {
      height = parseFloat(body.height);
      
      if (isNaN(height)) {
        return NextResponse.json(
          { error: "Height must be a valid number" },
          { status: 400 }
        );
      }

      // Validate height range based on unit
      const heightUnit = body.heightUnit || 'in';
      if (heightUnit === 'in') {
        if (height < 30 || height > 100) {
          return NextResponse.json(
            { error: "Height must be between 30 and 100 inches" },
            { status: 400 }
          );
        }
      } else if (heightUnit === 'cm') {
        if (height < 76 || height > 254) {
          return NextResponse.json(
            { error: "Height must be between 76 and 254 centimeters" },
            { status: 400 }
          );
        }
      }
    }
    
    // Check if MongoDB is configured
    const db = await connectDB();
    
    // If using mock connection, return success without saving to DB
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      const mockWeight = {
        _id: `mock_${Date.now()}`,
        userId,
        weight: weight,
        height: height,
        unit: body.unit || 'lbs',
        heightUnit: body.heightUnit || 'in',
        date: body.date,
        notes: body.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return NextResponse.json(mockWeight, { status: 201 });
    }

    const weightRecord = new Weight({
      userId,
      weight: weight,
      height: height,
      unit: body.unit || 'lbs',
      heightUnit: body.heightUnit || 'in',
      date: body.date,
      notes: body.notes,
    });

    await weightRecord.save();

    return NextResponse.json(weightRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating weight record:", error);
    
    // Check if it's a validation error
    if (error instanceof Error && error.message.includes('validation failed')) {
      return NextResponse.json(
        { error: "Invalid data provided. Please check your input." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create weight record" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("Weight API - Auth check:", { userId: userId ? "present" : "missing" });
    
    if (!userId) {
      console.log("Weight API - Unauthorized: No userId found");
      return NextResponse.json({ error: "Unauthorized - Please sign in again" }, { status: 401 });
    }

    const db = await connectDB();
    console.log("Weight API - Database connection:", { readyState: db.connection?.readyState });
    
    // If using mock connection, return mock data
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      console.log("Weight API - Using mock data");
      const mockData = [
        {
          _id: 'mock_1',
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
          _id: 'mock_2',
          userId,
          weight: 165.5,
          height: 70,
          unit: 'lbs',
          heightUnit: 'in',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          notes: 'Evening weight',
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

    console.log("Weight API - Fetching from database:", { userId, limit, page });

    const weights = await Weight.find({ userId })
      .sort({ date: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Weight.countDocuments({ userId });

    console.log("Weight API - Success:", { recordsFound: weights.length, total });

    return NextResponse.json({
      data: weights,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Weight API - Error fetching weight records:", error);
    return NextResponse.json(
      { error: "Failed to fetch weight records - Please try again" },
      { status: 500 }
    );
  }
} 