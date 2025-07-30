"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  TrendingUp, 
  Activity, 
  Scale, 
  Stethoscope,
  FileSpreadsheet,
  File,
  FileJson,
  Clock,
  Pill,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import BackButton from "@/components/back-button";
import { generateHealthDataPDF } from '@/lib/pdf-service';

interface BloodPressureData {
  _id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  date: string;
  category: string;
  notes?: string;
}

interface WeightData {
  _id: string;
  weight: number;
  height?: number;
  unit: string;
  heightUnit?: string;
  date: string;
  notes?: string;
}

interface BloodWorkData {
  _id: string;
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

interface DoctorVisitData {
  _id: string;
  doctorName: string;
  specialty: string;
  visitDate: string;
  visitType: string;
  status: string;
  diagnosis?: string;
  cost?: number;
}

interface GoalData {
  _id: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  targetDate: string;
  status: string;
  progress: number;
}

interface ReportData {
  bloodPressure: BloodPressureData[];
  weight: WeightData[];
  bloodWork: BloodWorkData[];
  doctorVisits: DoctorVisitData[];
  goals: GoalData[];
  medications: MedicationData[];
}

interface MedicationData {
  _id: string;
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
  birthdate?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
}

interface ReportConfig {
  dataTypes: string[];
  dateRange: string;
  format: 'pdf' | 'csv' | 'json';
}

interface ReportContent {
  title: string;
  generatedAt: string;
  dateRange: string;
  dataTypes: string[];
  summary: Record<string, unknown>;
  data: Record<string, unknown>;
  charts: Record<string, unknown> | null;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    bloodPressure: [],
    weight: [],
    bloodWork: [],
    doctorVisits: [],
    goals: [],
    medications: []
  });
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    dataTypes: ['bloodPressure', 'weight', 'bloodWork', 'doctorVisits', 'goals', 'medications'],
    dateRange: '30d',
    format: 'pdf'
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      
      const [bpResponse, weightResponse, bloodWorkResponse, doctorVisitsResponse, goalsResponse, medicationsResponse, userProfileResponse] = await Promise.all([
        fetch('/api/blood-pressure'),
        fetch('/api/weight'),
        fetch('/api/blood-work'),
        fetch('/api/doctor-visits'),
        fetch('/api/goals'),
        fetch('/api/medications'),
        fetch('/api/user-profile')
      ]);

      const bpData = bpResponse.ok ? await bpResponse.json() : { data: [] };
      const weightData = weightResponse.ok ? await weightResponse.json() : { data: [] };
      const bloodWorkData = bloodWorkResponse.ok ? await bloodWorkResponse.json() : { data: [] };
      const doctorVisitsData = doctorVisitsResponse.ok ? await doctorVisitsResponse.json() : { data: [] };
      const goalsData = goalsResponse.ok ? await goalsResponse.json() : { data: [] };
      const medicationsData = medicationsResponse.ok ? await medicationsResponse.json() : { data: [] };
      const userProfileData = userProfileResponse.ok ? await userProfileResponse.json() : null;

      setReportData({
        bloodPressure: bpData.data || [],
        weight: weightData.data || [],
        bloodWork: bloodWorkData.data || [],
        doctorVisits: doctorVisitsData.data || [],
        goals: goalsData.data || [],
        medications: medicationsData.data || []
      });

      // Set personal information if available
      if (userProfileData && !userProfileData.error) {
        setPersonalInfo({
          firstName: userProfileData.firstName || '',
          lastName: userProfileData.lastName || '',
          email: userProfileData.email || '',
          birthdate: userProfileData.birthdate,
          address: userProfileData.address,
          phone: userProfileData.phone
        });
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create report content based on configuration
      const reportContent = {
        title: 'MyHealthFirst Health Report',
        generatedAt: new Date().toISOString(),
        dateRange: reportConfig.dateRange,
        dataTypes: reportConfig.dataTypes,
        summary: generateSummary(),
        data: filterDataByDateRange(),
        charts: generateChartData()
      };

      // Export based on format
      if (reportConfig.format === 'json') {
        exportAsJSON(reportContent);
        toast.success('Report exported as JSON');
      } else if (reportConfig.format === 'csv') {
        exportAsCSV(reportContent);
        toast.success('Report exported as CSV');
      } else {
        await exportAsPDF(reportContent);
        // PDF success message is handled in exportAsPDF
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSummary = () => {
    // Only count records for selected data types
    const totalRecords = 
      (reportConfig.dataTypes.includes('bloodPressure') ? reportData.bloodPressure.length : 0) +
      (reportConfig.dataTypes.includes('weight') ? reportData.weight.length : 0) +
      (reportConfig.dataTypes.includes('bloodWork') ? reportData.bloodWork.length : 0) +
      (reportConfig.dataTypes.includes('doctorVisits') ? reportData.doctorVisits.length : 0) +
      (reportConfig.dataTypes.includes('goals') ? reportData.goals.length : 0) +
      (reportConfig.dataTypes.includes('medications') ? reportData.medications.length : 0);

    const completedGoals = reportConfig.dataTypes.includes('goals') 
      ? reportData.goals.filter((goal: GoalData) => goal.status === 'completed').length 
      : 0;
    const activeGoals = reportConfig.dataTypes.includes('goals')
      ? reportData.goals.filter((goal: GoalData) => goal.status === 'active').length 
      : 0;
    const activeMedications = reportConfig.dataTypes.includes('medications')
      ? reportData.medications.filter((med: MedicationData) => med.status === 'active').length 
      : 0;

    return {
      totalRecords,
      bloodPressureReadings: reportConfig.dataTypes.includes('bloodPressure') ? reportData.bloodPressure.length : 0,
      weightRecords: reportConfig.dataTypes.includes('weight') ? reportData.weight.length : 0,
      bloodWorkTests: reportConfig.dataTypes.includes('bloodWork') ? reportData.bloodWork.length : 0,
      doctorVisits: reportConfig.dataTypes.includes('doctorVisits') ? reportData.doctorVisits.length : 0,
      goals: reportConfig.dataTypes.includes('goals') ? {
        total: reportData.goals.length,
        completed: completedGoals,
        active: activeGoals,
        overdue: reportData.goals.filter((goal: GoalData) => goal.status === 'overdue').length
      } : { total: 0, completed: 0, active: 0, overdue: 0 },
      medications: reportConfig.dataTypes.includes('medications') ? {
        total: reportData.medications.length,
        active: activeMedications,
        completed: reportData.medications.filter((med: MedicationData) => med.status === 'completed').length,
        discontinued: reportData.medications.filter((med: MedicationData) => med.status === 'discontinued').length
      } : { total: 0, active: 0, completed: 0, discontinued: 0 }
    };
  };

  const filterDataByDateRange = () => {
    const now = new Date();
    let daysAgo: Date;

    switch (reportConfig.dateRange) {
      case '7d':
        daysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        daysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        daysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        daysAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        daysAgo = new Date(0); // All data
    }

    const filteredData: {
      bloodPressure?: BloodPressureData[];
      weight?: WeightData[];
      bloodWork?: BloodWorkData[];
      doctorVisits?: DoctorVisitData[];
      goals?: GoalData[];
      medications?: MedicationData[];
    } = {};

    // Only include data types that are selected in the configuration
    if (reportConfig.dataTypes.includes('bloodPressure')) {
      filteredData.bloodPressure = reportData.bloodPressure.filter((record: BloodPressureData) => 
        new Date(record.date) >= daysAgo
      );
    }

    if (reportConfig.dataTypes.includes('weight')) {
      filteredData.weight = reportData.weight.filter((record: WeightData) => 
        new Date(record.date) >= daysAgo
      );
    }

    if (reportConfig.dataTypes.includes('bloodWork')) {
      filteredData.bloodWork = reportData.bloodWork.filter((record: BloodWorkData) => 
        new Date(record.testDate) >= daysAgo
      );
    }

    if (reportConfig.dataTypes.includes('doctorVisits')) {
      filteredData.doctorVisits = reportData.doctorVisits.filter((record: DoctorVisitData) => 
        new Date(record.visitDate) >= daysAgo
      );
    }

    if (reportConfig.dataTypes.includes('goals')) {
      filteredData.goals = reportData.goals.filter((record: GoalData) => 
        new Date(record.startDate) >= daysAgo
      );
    }

    if (reportConfig.dataTypes.includes('medications')) {
      // Medications should be included regardless of start date - they are current medications
      // Only filter by status if needed (active, completed, etc.)
      filteredData.medications = reportData.medications;
    }

    return filteredData;
  };

  const generateChartData = () => {
    // Generate chart data for visualization - only for selected data types
    const chartData: Record<string, {
      labels: string[];
      systolic?: number[];
      diastolic?: number[];
      values?: number[];
    }> = {};

    if (reportConfig.dataTypes.includes('bloodPressure')) {
      chartData.bloodPressure = {
        labels: reportData.bloodPressure.slice(0, 10).map((record: BloodPressureData) => 
          new Date(record.date).toLocaleDateString()
        ),
        systolic: reportData.bloodPressure.slice(0, 10).map((record: BloodPressureData) => record.systolic),
        diastolic: reportData.bloodPressure.slice(0, 10).map((record: BloodPressureData) => record.diastolic)
      };
    }

    if (reportConfig.dataTypes.includes('weight')) {
      chartData.weight = {
        labels: reportData.weight.slice(0, 10).map((record: WeightData) => 
          new Date(record.date).toLocaleDateString()
        ),
        values: reportData.weight.slice(0, 10).map((record: WeightData) => record.weight)
      };
    }

    return chartData;
  };

  const exportAsJSON = (content: ReportContent) => {
    const dataStr = JSON.stringify(content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported as JSON');
  };

  const exportAsCSV = (content: ReportContent) => {
    // Convert report data to CSV format
    const csvData = convertToCSV(content);
    const dataBlob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported as CSV');
  };

  const exportAsPDF = async (content: ReportContent) => {
    try {
      // Validate that we have data to generate PDF
      const hasData = Object.values(content.data).some(data => 
        Array.isArray(data) && data.length > 0
      );
      
      if (!hasData) {
        toast.error('No data available to generate PDF report');
        return;
      }
      
      // Prepare data for PDF generation - map to expected format
      const pdfData = {
        bloodPressure: Array.isArray(content.data.bloodPressure) 
          ? content.data.bloodPressure.map((record: BloodPressureData) => ({
              systolic: record.systolic,
              diastolic: record.diastolic,
              pulse: record.pulse,
              date: record.date,
              category: record.category,
              notes: record.notes
            }))
          : [],
        bloodWork: Array.isArray(content.data.bloodWork)
          ? content.data.bloodWork.map((record: BloodWorkData) => ({
              testName: record.testName,
              testDate: record.testDate,
              results: record.results,
              category: record.category
            }))
          : [],
        doctorVisits: Array.isArray(content.data.doctorVisits)
          ? content.data.doctorVisits.map((record: DoctorVisitData) => ({
              doctorName: record.doctorName,
              specialty: record.specialty,
              visitDate: record.visitDate,
              visitType: record.visitType,
              status: record.status,
              diagnosis: record.diagnosis,
              cost: record.cost
            }))
          : [],
        weight: Array.isArray(content.data.weight)
          ? content.data.weight.map((record: WeightData) => ({
              weight: record.weight,
              height: record.height,
              unit: record.unit,
              heightUnit: record.heightUnit,
              date: record.date,
              notes: record.notes
            }))
          : [],
        medications: Array.isArray(content.data.medications)
          ? content.data.medications.map((record: MedicationData) => ({
              name: record.name,
              dosage: record.dosage,
              frequency: record.frequency,
              duration: record.duration,
              startDate: record.startDate,
              endDate: record.endDate,
              status: record.status,
              category: record.category,
              prescribedBy: record.prescribedBy,
              pharmacy: record.pharmacy,
              notes: record.notes,
              sideEffects: record.sideEffects,
              interactions: record.interactions
            }))
          : []
      };

      // Debug logging to check medication data
      console.log('Medications being sent to PDF:', pdfData.medications);
      console.log('Number of medications:', pdfData.medications.length);

      // Generate PDF using the existing service
      const pdfBuffer = await generateHealthDataPDF({
        patientName: personalInfo?.firstName || 'Your Health Data', // You can customize this
        reportDate: new Date().toLocaleDateString(),
        dataTypes: content.dataTypes,
        sharedData: pdfData,
        expiresInDays: 30,
        personalInfo: personalInfo ? {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          birthdate: personalInfo?.birthdate ? new Date(personalInfo.birthdate) : undefined,
          address: personalInfo?.address,
          phone: personalInfo?.phone
        } : undefined,
        birthdate: personalInfo?.birthdate ? new Date(personalInfo.birthdate) : undefined,
        address: personalInfo?.address,
        includeCharts: true,
        includeSummary: true
      });

      // Create blob and download
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create a more descriptive filename
      const dateRange = content.dateRange === 'all' ? 'all-time' : content.dateRange;
      const dataTypes = content.dataTypes.join('-');
      link.download = `health-report-${dataTypes}-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report. Please try again.');
    } finally {
      // setIsGeneratingPDF(false); // This line is removed
    }
  };

  const convertToCSV = (content: ReportContent): string => {
    let csvContent = 'Data Type,Date,Value,Notes\n';
    
    // Add blood pressure data
    if (content.data.bloodPressure && Array.isArray(content.data.bloodPressure)) {
      (content.data.bloodPressure as BloodPressureData[]).forEach((record) => {
        csvContent += `Blood Pressure,${record.date},${record.systolic}/${record.diastolic} mmHg,${record.notes || ''}\n`;
      });
    }
    
    // Add weight data
    if (content.data.weight && Array.isArray(content.data.weight)) {
      (content.data.weight as WeightData[]).forEach((record) => {
        csvContent += `Weight,${record.date},${record.weight} ${record.unit},${record.notes || ''}\n`;
      });
    }

    // Add blood work data
    if (content.data.bloodWork && Array.isArray(content.data.bloodWork)) {
      (content.data.bloodWork as BloodWorkData[]).forEach((record) => {
        csvContent += `Blood Work,${record.testDate},${record.testName},${record.category}\n`;
      });
    }

    // Add doctor visits data
    if (content.data.doctorVisits && Array.isArray(content.data.doctorVisits)) {
      (content.data.doctorVisits as DoctorVisitData[]).forEach((record) => {
        csvContent += `Doctor Visit,${record.visitDate},${record.doctorName} - ${record.specialty},${record.visitType}\n`;
      });
    }

    // Add goals data
    if (content.data.goals && Array.isArray(content.data.goals)) {
      (content.data.goals as GoalData[]).forEach((record) => {
        csvContent += `Goal,${record.startDate},${record.title} - ${record.currentValue}/${record.targetValue} ${record.unit},${record.status}\n`;
      });
    }

    // Add medications data
    if (content.data.medications && Array.isArray(content.data.medications)) {
      (content.data.medications as MedicationData[]).forEach((record) => {
        csvContent += `Medication,${record.startDate},${record.name} - ${record.dosage},${record.frequency}\n`;
      });
    }

    return csvContent;
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <File className="h-4 w-4" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'json':
        return <FileJson className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Reports</h1>
            <p className="text-gray-600">Generate and export your health data</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading report data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Reports</h1>
            <p className="text-gray-600">Generate and export your health data</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchReportData();
              toast.success('Reports data refreshed');
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>
            Customize your health report settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Types Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Data Types to Include</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'bloodPressure', label: 'Blood Pressure', icon: <Activity className="h-4 w-4" /> },
                { key: 'weight', label: 'Weight & BMI', icon: <Scale className="h-4 w-4" /> },
                { key: 'bloodWork', label: 'Blood Work', icon: <FileText className="h-4 w-4" /> },
                { key: 'doctorVisits', label: 'Doctor Visits', icon: <Stethoscope className="h-4 w-4" /> },
                { key: 'goals', label: 'Health Goals', icon: <TrendingUp className="h-4 w-4" /> },
                { key: 'medications', label: 'Medications', icon: <Pill className="h-4 w-4" /> }
              ].map((dataType) => (
                <div key={dataType.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={dataType.key}
                    checked={reportConfig.dataTypes.includes(dataType.key)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setReportConfig({
                          ...reportConfig,
                          dataTypes: [...reportConfig.dataTypes, dataType.key]
                        });
                      } else {
                        setReportConfig({
                          ...reportConfig,
                          dataTypes: reportConfig.dataTypes.filter(type => type !== dataType.key)
                        });
                      }
                    }}
                  />
                  <label htmlFor={dataType.key} className="text-sm flex items-center space-x-2">
                    {dataType.icon}
                    <span>{dataType.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <Select value={reportConfig.dateRange} onValueChange={(value) => setReportConfig({ ...reportConfig, dateRange: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Export Format</label>
              <Select value={reportConfig.format} onValueChange={(value: 'pdf' | 'csv' | 'json') => setReportConfig({ ...reportConfig, format: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={generateReport} 
            disabled={isGenerating || reportConfig.dataTypes.length === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                {reportConfig.format === 'pdf' ? 'Generating PDF...' : 'Generating Report...'}
              </>
            ) : (
              <>
                {getFormatIcon(reportConfig.format)}
                <span className="ml-2">Generate {reportConfig.format.toUpperCase()} Report</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.bloodPressure.length}</div>
            <p className="text-xs text-muted-foreground">readings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight Records</CardTitle>
            <Scale className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.weight.length}</div>
            <p className="text-xs text-muted-foreground">measurements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Work</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.bloodWork.length}</div>
            <p className="text-xs text-muted-foreground">tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.goals.length}</div>
            <p className="text-xs text-muted-foreground">objectives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medications</CardTitle>
            <Pill className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.medications.length}</div>
            <p className="text-xs text-muted-foreground">prescriptions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 