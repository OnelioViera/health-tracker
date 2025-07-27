import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Weight from "@/lib/models/Weight";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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
    
    const db = await connectDB();
    
    // If using mock connection, return success without saving to DB
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      const mockWeight = {
        _id: id,
        userId,
        weight: weight,
        height: height,
        unit: body.unit || 'lbs',
        heightUnit: body.heightUnit || 'in',
        date: body.date,
        notes: body.notes,
        updatedAt: new Date(),
      };
      
      return NextResponse.json(mockWeight, { status: 200 });
    }

    const weightRecord = await Weight.findOneAndUpdate(
      { _id: id, userId },
      {
        weight: weight,
        height: height,
        unit: body.unit || 'lbs',
        heightUnit: body.heightUnit || 'in',
        date: body.date,
        notes: body.notes,
      },
      { new: true }
    );

    if (!weightRecord) {
      return NextResponse.json({ error: "Weight record not found" }, { status: 404 });
    }

    return NextResponse.json(weightRecord, { status: 200 });
  } catch (error) {
    console.error("Error updating weight record:", error);
    
    // Check if it's a validation error
    if (error instanceof Error && error.message.includes('validation failed')) {
      return NextResponse.json(
        { error: "Invalid data provided. Please check your input." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update weight record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await connectDB();
    
    // If using mock connection, return success without saving to DB
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      return NextResponse.json({ message: "Weight record deleted" }, { status: 200 });
    }

    const weight = await Weight.findOneAndDelete({ _id: id, userId });

    if (!weight) {
      return NextResponse.json({ error: "Weight record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Weight record deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting weight record:", error);
    return NextResponse.json(
      { error: "Failed to delete weight record" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await connectDB();
    
    // If using mock connection, return mock data
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      const mockWeight = {
        _id: id,
        userId,
        weight: 165.0,
        height: 70,
        unit: 'lbs',
        heightUnit: 'in',
        date: new Date(),
        notes: 'Morning weight after workout',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return NextResponse.json(mockWeight, { status: 200 });
    }

    const weight = await Weight.findOne({ _id: id, userId });

    if (!weight) {
      return NextResponse.json({ error: "Weight record not found" }, { status: 404 });
    }

    return NextResponse.json(weight, { status: 200 });
  } catch (error) {
    console.error("Error fetching weight record:", error);
    return NextResponse.json(
      { error: "Failed to fetch weight record" },
      { status: 500 }
    );
  }
} 