import jsPDF from 'jspdf';

interface BloodPressureRecord {
  systolic: number;
  diastolic: number;
  pulse?: number;
  date: string;
  category: string;
  notes?: string;
}

interface BloodWorkRecord {
  testName: string;
  testDate: string;
  results: Array<{
    parameter: string;
    value: number;
    unit: string;
    referenceRange: { min: number; max: number };
    status: string;
  }>;
  category: string;
}

interface DoctorVisitRecord {
  doctorName: string;
  specialty: string;
  visitDate: string;
  visitType: string;
  status: string;
  diagnosis?: string;
  cost?: number;
}

interface WeightRecord {
  weight: number;
  height?: number;
  unit: string;
  heightUnit?: string;
  date: string;
  notes?: string;
}

interface MedicationRecord {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: string;
  endDate?: string;
  status: string;
  category: string;
  prescribedBy?: string;
  pharmacy?: string;
  notes?: string;
  sideEffects?: string[];
  interactions?: string[];
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  birthdate?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
}

export interface HealthData {
  bloodPressure?: BloodPressureRecord[];
  bloodWork?: BloodWorkRecord[];
  doctorVisits?: DoctorVisitRecord[];
  weight?: WeightRecord[];
  medications?: MedicationRecord[];
}

export interface PDFReportOptions {
  patientName: string;
  reportDate: string;
  dataTypes: string[];
  sharedData: HealthData;
  expiresInDays: number;
  personalInfo?: PersonalInfo;
  birthdate?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  includeCharts?: boolean;
  includeSummary?: boolean;
}

export async function generateHealthDataPDF(options: PDFReportOptions): Promise<Buffer> {
  const { patientName, reportDate, dataTypes, sharedData, expiresInDays, personalInfo, birthdate, address, includeCharts = true, includeSummary = true } = options;
  
  // Create PDF document
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12; // Reduced margin to fit more content
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;
  let currentPage = 1;
  
  // Helper function to add text with proper wrapping
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize * 0.4); // Return height used
  };
  
  // Helper function to check if we need a new page
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage();
      currentPage++;
      yPosition = margin;
      return true;
    }
    return false;
  };
  
  // Helper function to add section with automatic page breaks
  const addSection = (title: string, content: string, y: number) => {
    doc.setFontSize(14); // Smaller title font
    doc.setTextColor(102, 126, 234); // Blue color
    doc.setFont('helvetica', 'bold');
    const titleHeight = addText(title, margin, y, contentWidth, 14);
    
    doc.setFontSize(9); // Smaller content font
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const contentHeight = addText(content, margin, y + titleHeight + 3, contentWidth, 9);
    
    return titleHeight + contentHeight + 8; // Reduced spacing
  };
  
  // Header
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, pageWidth, 35, 'F'); // Smaller header
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20); // Smaller header font
  doc.setFont('helvetica', 'bold');
  doc.text('MyHealthFirst', margin, 20);
  
  doc.setFontSize(12); // Smaller subtitle font
  doc.setFont('helvetica', 'normal');
  doc.text('Health Data Report', margin, 30);
  
  yPosition = 45; // Reduced starting position
  
  // Personal Information Section
  if (personalInfo) {
    let personalInfoText = `Name: ${personalInfo.firstName} ${personalInfo.lastName}\nEmail: ${personalInfo.email}`;
    
    if (personalInfo.phone) {
      personalInfoText += `\nPhone: ${personalInfo.phone}`;
    }
    
    if (personalInfo.birthdate) {
      const birthdateStr = new Date(personalInfo.birthdate).toLocaleDateString();
      personalInfoText += `\nDate of Birth: ${birthdateStr}`;
    }
    
    if (personalInfo.address && (personalInfo.address.street || personalInfo.address.city || personalInfo.address.state)) {
      const addressParts = [];
      if (personalInfo.address.street) addressParts.push(personalInfo.address.street);
      if (personalInfo.address.city) addressParts.push(personalInfo.address.city);
      if (personalInfo.address.state) addressParts.push(personalInfo.address.state);
      if (personalInfo.address.zipCode) addressParts.push(personalInfo.address.zipCode);
      if (personalInfo.address.country) addressParts.push(personalInfo.address.country);
      
      if (addressParts.length > 0) {
        personalInfoText += `\nAddress: ${addressParts.join(', ')}`;
      }
    }
    
    const sectionHeight = addSection('Personal Information', personalInfoText, yPosition);
    checkNewPage(sectionHeight);
    yPosition += sectionHeight;
  }
  
  // Report Information
  doc.setTextColor(0, 0, 0);
  let reportInfo = `Report Date: ${reportDate}\nAccess Expires: ${expiresInDays} days from now`;
  
  if (birthdate) {
    const birthdateStr = new Date(birthdate).toLocaleDateString();
    reportInfo += `\nDate of Birth: ${birthdateStr}`;
  }
  
  if (address && (address.street || address.city || address.state)) {
    const addressParts = [];
    if (address.street) addressParts.push(address.street);
    if (address.city) addressParts.push(address.city);
    if (address.state) addressParts.push(address.state);
    if (address.zipCode) addressParts.push(address.zipCode);
    if (address.country) addressParts.push(address.country);
    
    if (addressParts.length > 0) {
      reportInfo += `\nAddress: ${addressParts.join(', ')}`;
    }
  }
  
  const reportSectionHeight = addSection('Report Information', reportInfo, yPosition);
  checkNewPage(reportSectionHeight);
  yPosition += reportSectionHeight;
  
  // Data Summary (only if includeSummary is true)
  if (includeSummary) {
    const dataTypeLabels = {
      bloodPressure: 'Blood Pressure Records',
      bloodWork: 'Blood Work Results',
      doctorVisits: 'Doctor Visits',
      weight: 'Weight & BMI Records',
      medications: 'Medications',
      all: 'All Health Data'
    };
    
    let summaryText = 'Data Types Included:\n';
    dataTypes.forEach(type => {
      const label = dataTypeLabels[type as keyof typeof dataTypeLabels] || type;
      let count = 0;
      
      if (type === 'all') {
        // Count all individual data types when "all" is selected
        count += Array.isArray(sharedData.bloodPressure) ? sharedData.bloodPressure.length : 0;
        count += Array.isArray(sharedData.bloodWork) ? sharedData.bloodWork.length : 0;
        count += Array.isArray(sharedData.doctorVisits) ? sharedData.doctorVisits.length : 0;
        count += Array.isArray(sharedData.weight) ? sharedData.weight.length : 0;
        count += Array.isArray(sharedData.medications) ? sharedData.medications.length : 0;
      } else {
        // Count specific data type
        const records = sharedData[type as keyof HealthData];
        count = Array.isArray(records) ? records.length : 0;
      }
      
      summaryText += `• ${label}: ${count} records\n`;
    });
    
    const summarySectionHeight = addSection('Data Summary', summaryText, yPosition);
    checkNewPage(summarySectionHeight);
    yPosition += summarySectionHeight;
  }
  
  // Charts Section (only if includeCharts is true)
  if (includeCharts) {
    let chartsText = 'Data Visualization Summary:\n\n';
    
    // Blood Pressure Chart Summary
    if (sharedData.bloodPressure && sharedData.bloodPressure.length > 0) {
      const avgSystolic = sharedData.bloodPressure.reduce((sum, record) => sum + record.systolic, 0) / sharedData.bloodPressure.length;
      const avgDiastolic = sharedData.bloodPressure.reduce((sum, record) => sum + record.diastolic, 0) / sharedData.bloodPressure.length;
      chartsText += `Blood Pressure Trends:\n• Average: ${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg\n• Total Readings: ${sharedData.bloodPressure.length}\n\n`;
    }
    
    // Weight Chart Summary
    if (sharedData.weight && sharedData.weight.length > 0) {
      const avgWeight = sharedData.weight.reduce((sum, record) => sum + record.weight, 0) / sharedData.weight.length;
      const unit = sharedData.weight[0]?.unit || 'lbs';
      chartsText += `Weight Trends:\n• Average Weight: ${avgWeight.toFixed(1)} ${unit}\n• Total Measurements: ${sharedData.weight.length}\n\n`;
    }
    
    // Medications Summary
    if (sharedData.medications && sharedData.medications.length > 0) {
      const activeMeds = sharedData.medications.filter(med => med.status === 'active').length;
      chartsText += `Medication Overview:\n• Total Medications: ${sharedData.medications.length}\n• Active Medications: ${activeMeds}\n\n`;
    }
    
    const chartsSectionHeight = addSection('Charts & Trends', chartsText, yPosition);
    checkNewPage(chartsSectionHeight);
    yPosition += chartsSectionHeight;
  }
  
  // Medications Section
  if (sharedData.medications && sharedData.medications.length > 0) {
    let medText = '';
    
    sharedData.medications.forEach((record: MedicationRecord, index: number) => {
      const medicationNumber = index + 1;
      const startDate = new Date(record.startDate).toLocaleDateString();
      const prescribedBy = record.prescribedBy ? ` (Prescribed by: ${record.prescribedBy})` : '';
      const pharmacy = record.pharmacy ? ` (Pharmacy: ${record.pharmacy})` : '';
      const notes = record.notes ? `\n  Notes: ${record.notes}` : '';
      const sideEffects = record.sideEffects && record.sideEffects.length > 0 ? 
        `\n  Side Effects: ${record.sideEffects.join(', ')}` : '';
      const interactions = record.interactions && record.interactions.length > 0 ? 
        `\n  Interactions: ${record.interactions.join(', ')}` : '';
      
      // Format each medication with clear separation and better line breaks
      medText += `${medicationNumber}. ${record.name} ${record.dosage} - ${record.frequency}${prescribedBy}${pharmacy}${notes}${sideEffects}${interactions}\n  Started: ${startDate}, Status: ${record.status}\n\n`;
    });
    
    // Remove the last double newline to avoid extra spacing
    medText = medText.trim();
    
    const medSectionHeight = addSection('Current Medications', medText, yPosition);
    checkNewPage(medSectionHeight);
    yPosition += medSectionHeight;
  }
  
  // Detailed Data Sections
  if (sharedData.bloodPressure && sharedData.bloodPressure.length > 0) {
    const bpText = sharedData.bloodPressure.map((record: BloodPressureRecord) => {
      const date = new Date(record.date).toLocaleDateString();
      const bp = `${record.systolic}/${record.diastolic} mmHg`;
      const pulse = record.pulse ? `, Pulse: ${record.pulse} bpm` : '';
      const notes = record.notes ? ` - ${record.notes}` : '';
      return `${date}: ${bp}${pulse}${notes}`;
    }).join('\n');
    
    const bpSectionHeight = addSection('Blood Pressure Records', bpText, yPosition);
    checkNewPage(bpSectionHeight);
    yPosition += bpSectionHeight;
  }
  
  if (sharedData.bloodWork && sharedData.bloodWork.length > 0) {
    const bwText = sharedData.bloodWork.map((record: BloodWorkRecord) => {
      const date = new Date(record.testDate).toLocaleDateString();
      const test = record.testName;
      const lab = record.results.length > 0 ? record.results[0].parameter : 'N/A'; // Assuming first result is lab name
      const results = record.results.length > 0 ? ` - ${record.results[0].value}${record.results[0].unit}` : '';
      const notes = record.results.length > 0 && record.results[0].status !== 'Normal' ? ` (${record.results[0].status})` : '';
      return `${date}: ${test} at ${lab}${results}${notes}`;
    }).join('\n');
    
    const bwSectionHeight = addSection('Blood Work Results', bwText, yPosition);
    checkNewPage(bwSectionHeight);
    yPosition += bwSectionHeight;
  }
  
  if (sharedData.doctorVisits && sharedData.doctorVisits.length > 0) {
    const dvText = sharedData.doctorVisits.map((record: DoctorVisitRecord) => {
      const date = new Date(record.visitDate).toLocaleDateString();
      const doctor = record.doctorName;
      const specialty = record.specialty;
      const type = record.visitType;
      const diagnosis = record.diagnosis ? ` - ${record.diagnosis}` : '';
      const treatment = record.cost ? ` ($${record.cost.toFixed(2)})` : '';
      return `${date}: ${doctor} (${specialty}) - ${type}${diagnosis}${treatment}`;
    }).join('\n');
    
    const dvSectionHeight = addSection('Doctor Visits', dvText, yPosition);
    checkNewPage(dvSectionHeight);
    yPosition += dvSectionHeight;
  }
  
  if (sharedData.weight && sharedData.weight.length > 0) {
    const weightText = sharedData.weight.map((record: WeightRecord) => {
      const date = new Date(record.date).toLocaleDateString();
      const weight = `${record.weight} ${record.unit}`;
      const height = record.height ? `, Height: ${record.height} ${record.heightUnit}` : '';
      const notes = record.notes ? ` - ${record.notes}` : '';
      return `${date}: ${weight}${height}${notes}`;
    }).join('\n');
    
    const weightSectionHeight = addSection('Weight & BMI Records', weightText, yPosition);
    checkNewPage(weightSectionHeight);
    yPosition += weightSectionHeight;
  }
  
  // Add page numbers to all pages
  for (let i = 1; i <= currentPage; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${currentPage}`, pageWidth - margin - 30, pageHeight - 10);
  }
  
  // Footer on last page
  doc.setPage(currentPage);
  const footerY = pageHeight - 25;
  doc.setFontSize(8); // Smaller footer font
  doc.setTextColor(128, 128, 128);
  doc.text('This report was generated by MyHealthFirst', margin, footerY);
  doc.text('Please ensure HIPAA compliance and patient confidentiality', margin, footerY + 4);
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, footerY + 8);
  
  // Convert to buffer
  const pdfBytes = doc.output('arraybuffer');
  return Buffer.from(pdfBytes);
}

// Alternative: Generate HTML for PDF conversion
export function generateHealthDataHTML(options: PDFReportOptions): string {
  const { patientName, reportDate, dataTypes, sharedData, expiresInDays, birthdate, address } = options;
  
  const dataTypeLabels = {
    bloodPressure: 'Blood Pressure Records',
    bloodWork: 'Blood Work Results',
    doctorVisits: 'Doctor Visits',
    weight: 'Weight & BMI Records',
    all: 'All Health Data'
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>MyHealthFirst - Health Data Report</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f8f9fa;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .section {
          margin-bottom: 30px;
          padding: 20px;
          border-radius: 8px;
          background: #f8f9fa;
        }
        .section h2 {
          color: #667eea;
          margin: 0 0 15px 0;
          font-size: 20px;
          font-weight: 600;
        }
        .section p {
          margin: 0;
          line-height: 1.6;
          color: #333;
        }
        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .data-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #667eea;
        }
        .data-item h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #667eea;
          font-weight: 600;
        }
        .data-item p {
          margin: 0;
          font-size: 12px;
          color: #666;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          border-top: 1px solid #e9ecef;
          font-size: 12px;
          color: #666;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 15px;
          border-radius: 6px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MyHealthFirst</h1>
          <p>Health Data Report</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h2>Report Information</h2>
            <p><strong>Patient:</strong> ${patientName}</p>
            <p><strong>Report Date:</strong> ${reportDate}</p>
            <p><strong>Access Expires:</strong> ${expiresInDays} days from now</p>
            ${birthdate ? `<p><strong>Date of Birth:</strong> ${new Date(birthdate).toLocaleDateString()}</p>` : ''}
            ${address && (address.street || address.city || address.state) ? `
              <p><strong>Address:</strong> ${[
                address.street,
                address.city,
                address.state,
                address.zipCode,
                address.country
              ].filter(Boolean).join(', ')}</p>
            ` : ''}
          </div>
          
          <div class="section">
            <h2>Data Summary</h2>
            <div class="data-grid">
              ${dataTypes.map(type => {
                const label = dataTypeLabels[type as keyof typeof dataTypeLabels] || type;
                let count = 0;
                
                if (type === 'all') {
                  // Count all individual data types when "all" is selected
                  count += Array.isArray(sharedData.bloodPressure) ? sharedData.bloodPressure.length : 0;
                  count += Array.isArray(sharedData.bloodWork) ? sharedData.bloodWork.length : 0;
                  count += Array.isArray(sharedData.doctorVisits) ? sharedData.doctorVisits.length : 0;
                  count += Array.isArray(sharedData.weight) ? sharedData.weight.length : 0;
                } else {
                  // Count specific data type
                  const records = sharedData[type as keyof HealthData];
                  count = Array.isArray(records) ? records.length : 0;
                }
                
                return `
                  <div class="data-item">
                    <h3>${label}</h3>
                    <p>${count} records</p>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          ${sharedData.bloodPressure && sharedData.bloodPressure.length > 0 ? `
            <div class="section">
              <h2>Blood Pressure Records</h2>
              ${sharedData.bloodPressure.map((record: BloodPressureRecord) => `
                <p><strong>${record.date}:</strong> ${record.systolic}/${record.diastolic} mmHg${record.pulse ? `, Pulse: ${record.pulse} bpm` : ''}</p>
              `).join('')}
            </div>
          ` : ''}
          
          ${sharedData.bloodWork && sharedData.bloodWork.length > 0 ? `
            <div class="section">
              <h2>Blood Work Results</h2>
              ${sharedData.bloodWork.map((record: BloodWorkRecord) => `
                <p><strong>${record.testName} (${record.testDate}):</strong> ${record.results.length > 0 ? record.results[0].parameter : 'N/A'}</p>
              `).join('')}
            </div>
          ` : ''}
          
          ${sharedData.doctorVisits && sharedData.doctorVisits.length > 0 ? `
            <div class="section">
              <h2>Doctor Visits</h2>
              ${sharedData.doctorVisits.map((record: DoctorVisitRecord) => `
                <p><strong>${record.visitDate}:</strong> ${record.doctorName} - ${record.specialty} (${record.visitType})</p>
              `).join('')}
            </div>
          ` : ''}
          
          ${sharedData.weight && sharedData.weight.length > 0 ? `
            <div class="section">
              <h2>Weight & BMI Records</h2>
              ${sharedData.weight.map((record: WeightRecord) => `
                <p><strong>${record.date}:</strong> ${record.weight} ${record.unit}${record.height ? `, Height: ${record.height} ${record.heightUnit}` : ''}</p>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="warning">
            <strong>Important:</strong> This report contains sensitive health information. Please ensure HIPAA compliance and maintain patient confidentiality.
          </div>
        </div>
        
        <div class="footer">
          <p>Generated by MyHealthFirst on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>This is an automated report. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
} 