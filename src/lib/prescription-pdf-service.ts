import jsPDF from 'jspdf';

interface Prescription {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay?: string;
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

interface PrescriptionPDFOptions {
  prescriptions: Prescription[];
  patientName: string;
  patientInfo?: {
    dateOfBirth?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  doctorInfo?: {
    name: string;
    license?: string;
    specialty?: string;
    phone?: string;
    address?: string;
  };
  pharmacyInfo?: {
    name: string;
    address?: string;
    phone?: string;
  };
  includeActiveOnly?: boolean;
  includeNotes?: boolean;
  includeSideEffects?: boolean;
  includeInteractions?: boolean;
}

export async function generatePrescriptionPDF(options: PrescriptionPDFOptions): Promise<Buffer> {
  const {
    prescriptions,
    patientName,
    patientInfo,
    doctorInfo,
    pharmacyInfo,
    includeActiveOnly = true,
    includeNotes = true,
    includeSideEffects = true,
    includeInteractions = true
  } = options;

  // Filter prescriptions if needed
  let filteredPrescriptions = prescriptions;
  if (includeActiveOnly) {
    filteredPrescriptions = prescriptions.filter(p => p.status === 'active');
  }

  // Create PDF document
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12; // Reduced margin
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;
  let currentPage = 1;
  
  // Helper function to add text with proper wrapping and smaller fonts
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 8) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    // Improved line height calculation to prevent overlapping
    return lines.length * (fontSize * 0.45); // Reduced from 0.5 to 0.45 for more compact spacing
  };
  
  // Helper function to check if we need a new page with better spacing
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin - 15) { // Increased buffer from 10 to 15
      doc.addPage();
      currentPage++;
      yPosition = margin;
      return true;
    }
    return false;
  };
  
  // Helper function to add section with automatic page breaks and smaller fonts
  const addSection = (title: string, content: string, y: number, fontSize: number = 9) => {
    doc.setFontSize(fontSize + 1); // Smaller title font
    doc.setTextColor(102, 126, 234); // Blue color
    doc.setFont('helvetica', 'bold');
    const titleHeight = addText(title, margin, y, contentWidth, fontSize + 1);
    
    doc.setFontSize(fontSize);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const contentHeight = addText(content, margin, y + titleHeight + 2, contentWidth, fontSize); // Reduced spacing from 4 to 2
    
    return titleHeight + contentHeight + 2; // Reduced spacing from 4 to 2 for even more compact layout
  };

  // Header with smaller fonts
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, pageWidth, 30, 'F'); // Smaller header height
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); // Smaller header font
  doc.setFont('helvetica', 'bold');
  doc.text('PRESCRIPTION LIST', margin, 18);
  
  doc.setFontSize(9); // Smaller subtitle font
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 26);
  
  yPosition = 35; // Reduced starting position from 40 to 35 for more compact spacing

  // Patient Information Section
  let patientInfoText = `Patient Name: ${patientName}`;
  
  if (patientInfo) {
    if (patientInfo.dateOfBirth) {
      patientInfoText += `\nDate of Birth: ${patientInfo.dateOfBirth}`;
    }
    if (patientInfo.address) {
      patientInfoText += `\nAddress: ${patientInfo.address}`;
    }
    if (patientInfo.phone) {
      patientInfoText += `\nPhone: ${patientInfo.phone}`;
    }
    if (patientInfo.email) {
      patientInfoText += `\nEmail: ${patientInfo.email}`;
    }
  }
  
  const patientSectionHeight = addSection('Patient Information', patientInfoText, yPosition);
  checkNewPage(patientSectionHeight);
  yPosition += patientSectionHeight;

  // Doctor Information Section
  if (doctorInfo) {
    let doctorInfoText = `Doctor: ${doctorInfo.name}`;
    
    if (doctorInfo.specialty) {
      doctorInfoText += `\nSpecialty: ${doctorInfo.specialty}`;
    }
    if (doctorInfo.license) {
      doctorInfoText += `\nLicense: ${doctorInfo.license}`;
    }
    if (doctorInfo.phone) {
      doctorInfoText += `\nPhone: ${doctorInfo.phone}`;
    }
    if (doctorInfo.address) {
      doctorInfoText += `\nAddress: ${doctorInfo.address}`;
    }
    
    const doctorSectionHeight = addSection('Prescribing Physician', doctorInfoText, yPosition);
    checkNewPage(doctorSectionHeight);
    yPosition += doctorSectionHeight;
  }

  // Pharmacy Information Section
  if (pharmacyInfo) {
    let pharmacyInfoText = `Pharmacy: ${pharmacyInfo.name}`;
    
    if (pharmacyInfo.address) {
      pharmacyInfoText += `\nAddress: ${pharmacyInfo.address}`;
    }
    if (pharmacyInfo.phone) {
      pharmacyInfoText += `\nPhone: ${pharmacyInfo.phone}`;
    }
    
    const pharmacySectionHeight = addSection('Pharmacy Information', pharmacyInfoText, yPosition);
    checkNewPage(pharmacySectionHeight);
    yPosition += pharmacySectionHeight;
  }

  // Prescriptions Section with smaller fonts
  if (filteredPrescriptions.length > 0) {
    let prescriptionsText = '';
    
    filteredPrescriptions.forEach((prescription, index) => {
      const prescriptionNumber = index + 1;
      const startDate = new Date(prescription.startDate).toLocaleDateString();
      const endDate = prescription.endDate ? new Date(prescription.endDate).toLocaleDateString() : 'Ongoing';
      
      prescriptionsText += `${prescriptionNumber}. ${prescription.name.toUpperCase()}\n`;
      prescriptionsText += `   Dosage: ${prescription.dosage}\n`;
      prescriptionsText += `   Frequency: ${prescription.frequency}\n`;
      if (prescription.timeOfDay) {
        prescriptionsText += `   Time: ${prescription.timeOfDay}\n`;
      }
      prescriptionsText += `   Duration: ${prescription.duration}\n`;
      prescriptionsText += `   Start Date: ${startDate}\n`;
      if (prescription.endDate) {
        prescriptionsText += `   End Date: ${endDate}\n`;
      }
      prescriptionsText += `   Status: ${prescription.status}\n`;
      
      if (prescription.prescribedBy) {
        prescriptionsText += `   Prescribed by: ${prescription.prescribedBy}\n`;
      }
      
      if (prescription.pharmacy) {
        prescriptionsText += `   Pharmacy: ${prescription.pharmacy}\n`;
      }
      
      if (includeNotes && prescription.notes) {
        prescriptionsText += `   Notes: ${prescription.notes}\n`;
      }
      
      if (includeSideEffects && prescription.sideEffects && prescription.sideEffects.length > 0) {
        prescriptionsText += `   Side Effects: ${prescription.sideEffects.join(', ')}\n`;
      }
      
      if (includeInteractions && prescription.interactions && prescription.interactions.length > 0) {
        prescriptionsText += `   Drug Interactions: ${prescription.interactions.join(', ')}\n`;
      }
      
      prescriptionsText += '\n'; // Reduced from double line break to single for more compact spacing
    });
    
    const prescriptionsSectionHeight = addSection('Current Prescriptions', prescriptionsText, yPosition);
    checkNewPage(prescriptionsSectionHeight);
    yPosition += prescriptionsSectionHeight;
  } else {
    const noPrescriptionsText = 'No prescriptions found.';
    const noPrescriptionsSectionHeight = addSection('Current Prescriptions', noPrescriptionsText, yPosition);
    checkNewPage(noPrescriptionsSectionHeight);
    yPosition += noPrescriptionsSectionHeight;
  }

  // Summary Section
  const activeCount = filteredPrescriptions.filter(p => p.status === 'active').length;
  const completedCount = filteredPrescriptions.filter(p => p.status === 'completed').length;
  const discontinuedCount = filteredPrescriptions.filter(p => p.status === 'discontinued').length;
  
  let summaryText = `Total Prescriptions: ${filteredPrescriptions.length}\n`;
  summaryText += `Active: ${activeCount}\n`;
  summaryText += `Completed: ${completedCount}\n`;
  summaryText += `Discontinued: ${discontinuedCount}`; // Removed extra line break for more compact spacing
  
  const summarySectionHeight = addSection('Prescription Summary', summaryText, yPosition);
  checkNewPage(summarySectionHeight);
  yPosition += summarySectionHeight;

  // Add page numbers to all pages with smaller font
  for (let i = 1; i <= currentPage; i++) {
    doc.setPage(i);
    doc.setFontSize(7); // Smaller page number font
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${currentPage}`, pageWidth - margin - 25, pageHeight - 8);
  }
  
  // Footer on last page with smaller font
  doc.setPage(currentPage);
  const footerY = pageHeight - 20; // Reduced footer position
  doc.setFontSize(7); // Smaller footer font
  doc.setTextColor(128, 128, 128);
  doc.text('This prescription list was generated by MyHealthFirst', margin, footerY);
  doc.text('Please ensure HIPAA compliance and patient confidentiality', margin, footerY + 3);
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, footerY + 6);
  
  // Convert to buffer
  const pdfBytes = doc.output('arraybuffer');
  return Buffer.from(pdfBytes);
}

// Alternative: Generate HTML for prescription PDF
export function generatePrescriptionHTML(options: PrescriptionPDFOptions): string {
  const {
    prescriptions,
    patientName,
    patientInfo,
    doctorInfo,
    pharmacyInfo,
    includeActiveOnly = true,
    includeNotes = true,
    includeSideEffects = true,
    includeInteractions = true
  } = options;

  // Filter prescriptions if needed
  let filteredPrescriptions = prescriptions;
  if (includeActiveOnly) {
    filteredPrescriptions = prescriptions.filter(p => p.status === 'active');
  }

  const activeCount = filteredPrescriptions.filter(p => p.status === 'active').length;
  const completedCount = filteredPrescriptions.filter(p => p.status === 'completed').length;
  const discontinuedCount = filteredPrescriptions.filter(p => p.status === 'discontinued').length;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>MyHealthFirst - Prescription List</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 15px;
          background: #f8f9fa;
          font-size: 14px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 20px;
        }
        .section {
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 6px;
          background: #f8f9fa;
        }
        .section h2 {
          color: #667eea;
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
        }
        .section p {
          margin: 0;
          line-height: 1.4;
          color: #333;
          font-size: 13px;
        }
        .prescription-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 12px;
          border-left: 3px solid #667eea;
        }
        .prescription-item h3 {
          margin: 0 0 8px 0;
          color: #667eea;
          font-size: 15px;
          font-weight: 600;
        }
        .prescription-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
          margin-top: 8px;
        }
        .detail-item {
          font-size: 12px;
          color: #666;
        }
        .detail-item strong {
          color: #333;
        }
        .status-active {
          color: #28a745;
          font-weight: 600;
        }
        .status-completed {
          color: #007bff;
          font-weight: 600;
        }
        .status-discontinued {
          color: #dc3545;
          font-weight: 600;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        .summary-item {
          background: white;
          padding: 12px;
          border-radius: 4px;
          text-align: center;
        }
        .summary-item h3 {
          margin: 0 0 4px 0;
          font-size: 20px;
          color: #667eea;
        }
        .summary-item p {
          margin: 0;
          font-size: 12px;
          color: #666;
        }
        .footer {
          background: #f8f9fa;
          padding: 15px 20px;
          text-align: center;
          border-top: 1px solid #e9ecef;
          font-size: 11px;
          color: #666;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 12px;
          border-radius: 4px;
          margin-top: 15px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PRESCRIPTION LIST</h1>
          <p>MyHealthFirst - Patient Medication Summary</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h2>Patient Information</h2>
            <p><strong>Name:</strong> ${patientName}</p>
            ${patientInfo?.dateOfBirth ? `<p><strong>Date of Birth:</strong> ${patientInfo.dateOfBirth}</p>` : ''}
            ${patientInfo?.address ? `<p><strong>Address:</strong> ${patientInfo.address}</p>` : ''}
            ${patientInfo?.phone ? `<p><strong>Phone:</strong> ${patientInfo.phone}</p>` : ''}
            ${patientInfo?.email ? `<p><strong>Email:</strong> ${patientInfo.email}</p>` : ''}
          </div>
          
          ${doctorInfo ? `
            <div class="section">
              <h2>Prescribing Physician</h2>
              <p><strong>Doctor:</strong> ${doctorInfo.name}</p>
              ${doctorInfo.specialty ? `<p><strong>Specialty:</strong> ${doctorInfo.specialty}</p>` : ''}
              ${doctorInfo.license ? `<p><strong>License:</strong> ${doctorInfo.license}</p>` : ''}
              ${doctorInfo.phone ? `<p><strong>Phone:</strong> ${doctorInfo.phone}</p>` : ''}
              ${doctorInfo.address ? `<p><strong>Address:</strong> ${doctorInfo.address}</p>` : ''}
            </div>
          ` : ''}
          
          ${pharmacyInfo ? `
            <div class="section">
              <h2>Pharmacy Information</h2>
              <p><strong>Pharmacy:</strong> ${pharmacyInfo.name}</p>
              ${pharmacyInfo.address ? `<p><strong>Address:</strong> ${pharmacyInfo.address}</p>` : ''}
              ${pharmacyInfo.phone ? `<p><strong>Phone:</strong> ${pharmacyInfo.phone}</p>` : ''}
            </div>
          ` : ''}
          
          <div class="section">
            <h2>Current Prescriptions</h2>
            ${filteredPrescriptions.length > 0 ? filteredPrescriptions.map((prescription, index) => {
              const startDate = new Date(prescription.startDate).toLocaleDateString();
              const endDate = prescription.endDate ? new Date(prescription.endDate).toLocaleDateString() : 'Ongoing';
              
              return `
                <div class="prescription-item">
                  <h3>${prescription.name.toUpperCase()}</h3>
                  <div class="prescription-details">
                    <div class="detail-item"><strong>Dosage:</strong> ${prescription.dosage}</div>
                    <div class="detail-item"><strong>Frequency:</strong> ${prescription.frequency}</div>
                    ${prescription.timeOfDay ? `<div class="detail-item"><strong>Time:</strong> ${prescription.timeOfDay}</div>` : ''}
                    <div class="detail-item"><strong>Duration:</strong> ${prescription.duration}</div>
                    <div class="detail-item"><strong>Start Date:</strong> ${startDate}</div>
                    ${prescription.endDate ? `<div class="detail-item"><strong>End Date:</strong> ${endDate}</div>` : ''}
                    <div class="detail-item"><strong>Status:</strong> <span class="status-${prescription.status}">${prescription.status}</span></div>
                    ${prescription.prescribedBy ? `<div class="detail-item"><strong>Prescribed by:</strong> ${prescription.prescribedBy}</div>` : ''}
                    ${prescription.pharmacy ? `<div class="detail-item"><strong>Pharmacy:</strong> ${prescription.pharmacy}</div>` : ''}
                  </div>
                  ${includeNotes && prescription.notes ? `<p><strong>Notes:</strong> ${prescription.notes}</p>` : ''}
                  ${includeSideEffects && prescription.sideEffects && prescription.sideEffects.length > 0 ? `<p><strong>Side Effects:</strong> ${prescription.sideEffects.join(', ')}</p>` : ''}
                  ${includeInteractions && prescription.interactions && prescription.interactions.length > 0 ? `<p><strong>Drug Interactions:</strong> ${prescription.interactions.join(', ')}</p>` : ''}
                </div>
              `;
            }).join('') : '<p>No prescriptions found.</p>'}
          </div>
          
          <div class="section">
            <h2>Prescription Summary</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <h3>${filteredPrescriptions.length}</h3>
                <p>Total Prescriptions</p>
              </div>
              <div class="summary-item">
                <h3>${activeCount}</h3>
                <p>Active</p>
              </div>
              <div class="summary-item">
                <h3>${completedCount}</h3>
                <p>Completed</p>
              </div>
              <div class="summary-item">
                <h3>${discontinuedCount}</h3>
                <p>Discontinued</p>
              </div>
            </div>
          </div>
          
          <div class="warning">
            <strong>Important:</strong> This prescription list contains sensitive medical information. Please ensure HIPAA compliance and maintain patient confidentiality.
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