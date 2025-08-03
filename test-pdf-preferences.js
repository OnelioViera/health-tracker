// Test script for PDF preferences API
const testPdfPreferences = async () => {
  const baseUrl = 'http://localhost:3003';
  
  // Test data
  const testPreferences = {
    patientName: "John Doe",
    patientInfo: {
      dateOfBirth: "1990-01-01",
      address: "123 Main St, City, State 12345",
      phone: "555-123-4567",
      email: "john.doe@email.com"
    },
    doctorInfo: {
      name: "Dr. Smith",
      license: "MD123456",
      specialty: "Cardiology",
      phone: "555-987-6543",
      address: "456 Medical Center Dr, City, State 12345"
    },
    pharmacyInfo: {
      name: "CVS Pharmacy",
      address: "789 Pharmacy Ave, City, State 12345",
      phone: "555-456-7890"
    },
    includeActiveOnly: true,
    includeNotes: true,
    includeSideEffects: true,
    includeInteractions: true
  };

  try {
    console.log('Testing PDF preferences API...');
    
    // Test saving preferences
    console.log('1. Testing POST /api/pdf-preferences...');
    const saveResponse = await fetch(`${baseUrl}/api/pdf-preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPreferences),
    });
    
    if (saveResponse.ok) {
      const saveResult = await saveResponse.json();
      console.log('✅ Save preferences successful:', saveResult.message);
    } else {
      console.log('❌ Save preferences failed:', await saveResponse.text());
    }
    
    // Test loading preferences
    console.log('2. Testing GET /api/pdf-preferences...');
    const loadResponse = await fetch(`${baseUrl}/api/pdf-preferences`);
    
    if (loadResponse.ok) {
      const loadResult = await loadResponse.json();
      console.log('✅ Load preferences successful:', loadResult);
    } else {
      console.log('❌ Load preferences failed:', await loadResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testPdfPreferences(); 