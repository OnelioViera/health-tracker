const fetch = require('node-fetch');

// Function to add a blood pressure reading via the API
async function addBloodPressureReading(readingData) {
  try {
    const response = await fetch('http://localhost:3001/api/blood-pressure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(readingData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Successfully added reading:', result);
      return result;
    } else {
      const error = await response.text();
      console.error('Failed to add reading:', error);
      return null;
    }
  } catch (error) {
    console.error('Error adding reading:', error);
    return null;
  }
}

// Add the correct readings
async function addAllReadings() {
  console.log('Adding blood pressure readings...');
  
  // Reading 1: 8/2/2025 at 5:56 AM - 115/80 mmHg
  const reading1 = {
    systolic: 115,
    diastolic: 80,
    pulse: 62,
    date: '2025-08-02T05:56:00.000Z',
    notes: 'Morning reading'
  };
  
  console.log('Adding reading 1:', reading1);
  await addBloodPressureReading(reading1);
  
  // Reading 2: 8/1/2025 at 7:15 PM - 106/72 mmHg
  const reading2 = {
    systolic: 106,
    diastolic: 72,
    pulse: 60,
    date: '2025-08-01T19:15:00.000Z',
    notes: 'Evening reading'
  };
  
  console.log('Adding reading 2:', reading2);
  await addBloodPressureReading(reading2);
  
  console.log('Finished adding readings');
}

// Run the script
addAllReadings().catch(console.error); 