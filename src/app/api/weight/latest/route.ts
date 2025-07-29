import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Weight from "@/lib/models/Weight";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    
    // If using mock connection, return mock data
    if (db.connection?.readyState === 1 && !process.env.MONGODB_URI?.startsWith('mongodb')) {
      const mockLatestWeight = {
        _id: 'mock_latest',
        userId,
        weight: 165.0,
        height: 70,
        unit: 'lbs',
        heightUnit: 'in',
        date: new Date(),
        notes: 'Latest weight entry',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return NextResponse.json(mockLatestWeight);
    }

    // Get the most recent weight record
    const latestWeight = await Weight.findOne({ userId })
      .sort({ date: -1 })
      .limit(1);

    if (!latestWeight) {
      return NextResponse.json({ error: "No weight records found" }, { status: 404 });
    }

    return NextResponse.json(latestWeight);
  } catch (error) {
    console.error("Error fetching latest weight:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest weight" },
      { status: 500 }
    );
  }
} 