import jsPDF from 'jspdf';

export interface HealthData {
  bloodPressure?: any[];
  bloodWork?: any[];
  doctorVisits?: any[];
  weight?: any[];
}

export interface PDFReportOptions {
  patientName: string;
  reportDate: string;
  dataTypes: string[];
  sharedData: HealthData;
  expiresInDays: number;
  birthdate?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export async function generateHealthDataPDF(options: PDFReportOptions): Promise<Buffer> {
  const { patientName, reportDate, dataTypes, sharedData, expiresInDays, birthdate, address } = options;
  
  // Create PDF document
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;
  
  // Helper function to add text with proper wrapping
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize * 0.4); // Return height used
  };
  
  // Helper function to add section
  const addSection = (title: string, content: string, y: number) => {
    doc.setFontSize(16);
    doc.setTextColor(102, 126, 234); // Blue color
    doc.setFont(undefined, 'bold');
    const titleHeight = addText(title, margin, y, contentWidth, 16);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    const contentHeight = addText(content, margin, y + titleHeight + 5, contentWidth, 12);
    
    return titleHeight + contentHeight + 10;
  };
  
  // Header
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('MyHealthFirst', margin, 25);
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'normal');
  doc.text('Health Data Report', margin, 35);
  
  yPosition = 50;
  
  // Report Information
  doc.setTextColor(0, 0, 0);
  let reportInfo = `Patient: ${patientName}\nReport Date: ${reportDate}\nAccess Expires: ${expiresInDays} days from now`;
  
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
  
  yPosition += addSection('Report Information', reportInfo, yPosition);
  
  // Data Summary
  const dataTypeLabels = {
    bloodPressure: 'Blood Pressure Records',
    bloodWork: 'Blood Work Results',
    doctorVisits: 'Doctor Visits',
    weight: 'Weight & BMI Records',
    all: 'All Health Data'
  };
  
  let summaryText = 'Shared Data Types:\n';
  dataTypes.forEach(type => {
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
    
    summaryText += `• ${label}: ${count} records\n`;
  });
  
  yPosition += addSection('Data Summary', summaryText, yPosition);
  
  // Detailed Data Sections
  if (sharedData.bloodPressure && sharedData.bloodPressure.length > 0) {
    const bpText = sharedData.bloodPressure.map((record: any) => {
      const date = new Date(record.date).toLocaleDateString();
      const bp = `${record.systolic}/${record.diastolic} mmHg`;
      const pulse = record.pulse ? `, Pulse: ${record.pulse} bpm` : '';
      const notes = record.notes ? ` - ${record.notes}` : '';
      return `${date}: ${bp}${pulse}${notes}`;
    }).join('\n');
    
    yPosition += addSection('Blood Pressure Records', bpText, yPosition);
  }
  
  if (sharedData.bloodWork && sharedData.bloodWork.length > 0) {
    const bwText = sharedData.bloodWork.map((record: any) => {
      const date = new Date(record.testDate).toLocaleDateString();
      const test = record.testName;
      const lab = record.labName;
      const results = record.results ? ` - ${record.results}` : '';
      const notes = record.notes ? ` (${record.notes})` : '';
      return `${date}: ${test} at ${lab}${results}${notes}`;
    }).join('\n');
    
    yPosition += addSection('Blood Work Results', bwText, yPosition);
  }
  
  if (sharedData.doctorVisits && sharedData.doctorVisits.length > 0) {
    const dvText = sharedData.doctorVisits.map((record: any) => {
      const date = new Date(record.visitDate).toLocaleDateString();
      const doctor = record.doctorName;
      const specialty = record.specialty;
      const type = record.visitType;
      const diagnosis = record.diagnosis ? ` - ${record.diagnosis}` : '';
      const treatment = record.treatment ? ` (${record.treatment})` : '';
      const notes = record.notes ? ` - ${record.notes}` : '';
      return `${date}: ${doctor} (${specialty}) - ${type}${diagnosis}${treatment}${notes}`;
    }).join('\n');
    
    yPosition += addSection('Doctor Visits', dvText, yPosition);
  }
  
  if (sharedData.weight && sharedData.weight.length > 0) {
    const weightText = sharedData.weight.map((record: any) => {
      const date = new Date(record.date).toLocaleDateString();
      const weight = `${record.weight} ${record.unit}`;
      const height = record.height ? `, Height: ${record.height} ${record.heightUnit}` : '';
      const bmi = record.bmi ? `, BMI: ${record.bmi}` : '';
      const notes = record.notes ? ` - ${record.notes}` : '';
      return `${date}: ${weight}${height}${bmi}${notes}`;
    }).join('\n');
    
    yPosition += addSection('Weight & BMI Records', weightText, yPosition);
  }
  
  // Footer
  const footerY = pageHeight - 30;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('This report was generated by MyHealthFirst', margin, footerY);
  doc.text('Please ensure HIPAA compliance and patient confidentiality', margin, footerY + 5);
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, footerY + 10);
  
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
              ${sharedData.bloodPressure.map((record: any) => `
                <p><strong>${record.date}:</strong> ${record.systolic}/${record.diastolic} mmHg${record.pulse ? `, Pulse: ${record.pulse} bpm` : ''}</p>
              `).join('')}
            </div>
          ` : ''}
          
          ${sharedData.bloodWork && sharedData.bloodWork.length > 0 ? `
            <div class="section">
              <h2>Blood Work Results</h2>
              ${sharedData.bloodWork.map((record: any) => `
                <p><strong>${record.testName} (${record.testDate}):</strong> ${record.labName}</p>
              `).join('')}
            </div>
          ` : ''}
          
          ${sharedData.doctorVisits && sharedData.doctorVisits.length > 0 ? `
            <div class="section">
              <h2>Doctor Visits</h2>
              ${sharedData.doctorVisits.map((record: any) => `
                <p><strong>${record.visitDate}:</strong> ${record.doctorName} - ${record.specialty} (${record.visitType})</p>
              `).join('')}
            </div>
          ` : ''}
          
          ${sharedData.weight && sharedData.weight.length > 0 ? `
            <div class="section">
              <h2>Weight & BMI Records</h2>
              ${sharedData.weight.map((record: any) => `
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