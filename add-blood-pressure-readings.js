const { MongoClient } = require('mongodb');

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';

async function addBloodPressureReadings() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('bloodpressures');
    
    // Clear existing blood pressure readings for the user
    await collection.deleteMany({ userId: 'user_30OKlvOo8isfwT4fu6adMH81TYo' });
    console.log('Cleared existing blood pressure readings');
    
    // Add the correct readings
    const readings = [
      {
        userId: 'user_30OKlvOo8isfwT4fu6adMH81TYo',
        systolic: 115,
        diastolic: 80,
        pulse: 62,
        date: new Date('2025-08-02T05:56:00.000Z'), // 8/2/2025 at 5:56 AM
        notes: 'Morning reading',
        category: 'normal',
        createdAt: new Date('2025-08-02T05:56:00.000Z'),
        updatedAt: new Date('2025-08-02T05:56:00.000Z'),
      },
      {
        userId: 'user_30OKlvOo8isfwT4fu6adMH81TYo',
        systolic: 106,
        diastolic: 72,
        pulse: 60,
        date: new Date('2025-08-01T19:15:00.000Z'), // 8/1/2025 at 7:15 PM
        notes: 'Evening reading',
        category: 'normal',
        createdAt: new Date('2025-08-01T19:15:00.000Z'),
        updatedAt: new Date('2025-08-01T19:15:00.000Z'),
      }
    ];
    
    const result = await collection.insertMany(readings);
    console.log(`Added ${result.insertedCount} blood pressure readings`);
    
    // Verify the readings were added
    const allReadings = await collection.find({ userId: 'user_30OKlvOo8isfwT4fu6adMH81TYo' }).sort({ date: -1 }).toArray();
    console.log('Current blood pressure readings:');
    allReadings.forEach(reading => {
      console.log(`${reading.systolic}/${reading.diastolic} mmHg - ${reading.date.toLocaleString()} - Pulse: ${reading.pulse} bpm`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

addBloodPressureReadings(); 