const fs = require('fs');
const path = require('path');

// Test data for prescription PDF generation
const testData = {
  patientName: "John Doe",
  patientInfo: {
    dateOfBirth: "1985-03-15",
    address: "123 Main St, Anytown, USA",
    phone: "555-123-4567",
    email: "john.doe@email.com"
  },
  doctorInfo: {
    name: "Dr. Sarah Smith",
    license: "MD123456",
    specialty: "Cardiology",
    phone: "555-987-6543",
    address: "456 Medical Center Dr, Anytown, USA"
  },
  pharmacyInfo: {
    name: "CVS Pharmacy",
    address: "789 Pharmacy Ave, Anytown, USA",
    phone: "555-456-7890"
  },
  includeActiveOnly: true,
  includeNotes: true,
  includeSideEffects: true,
  includeInteractions: true
};

async function testPrescriptionPDF() {
  try {
    console.log('Testing prescription PDF generation...');
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3002/api/prescriptions/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const outputPath = path.join(__dirname, 'test-prescription.pdf');
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      console.log(`✅ PDF generated successfully! Saved to: ${outputPath}`);
      console.log(`📄 File size: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
    } else {
      const error = await response.text();
      console.error(`❌ Error generating PDF: ${response.status} - ${error}`);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPrescriptionPDF(); 