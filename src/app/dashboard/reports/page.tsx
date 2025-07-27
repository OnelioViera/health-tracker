"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Scale, 
  Stethoscope,
  FileSpreadsheet,
  File,
  FileJson,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import BackButton from "@/components/back-button";

interface ReportData {
  bloodPressure: any[];
  weight: any[];
  bloodWork: any[];
  doctorVisits: any[];
  goals: any[];
}

interface ReportConfig {
  dataTypes: string[];
  dateRange: string;
  format: 'pdf' | 'csv' | 'json';
  includeCharts: boolean;
  includeSummary: boolean;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    bloodPressure: [],
    weight: [],
    bloodWork: [],
    doctorVisits: [],
    goals: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    dataTypes: ['bloodPressure', 'weight', 'bloodWork', 'doctorVisits', 'goals'],
    dateRange: '30d',
    format: 'pdf',
    includeCharts: true,
    includeSummary: true
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      
      const [bpResponse, weightResponse, bloodWorkResponse, doctorVisitsResponse, goalsResponse] = await Promise.all([
        fetch('/api/blood-pressure'),
        fetch('/api/weight'),
        fetch('/api/blood-work'),
        fetch('/api/doctor-visits'),
        fetch('/api/goals')
      ]);

      const bpData = bpResponse.ok ? await bpResponse.json() : { data: [] };
      const weightData = weightResponse.ok ? await weightResponse.json() : { data: [] };
      const bloodWorkData = bloodWorkResponse.ok ? await bloodWorkResponse.json() : { data: [] };
      const doctorVisitsData = doctorVisitsResponse.ok ? await doctorVisitsResponse.json() : { data: [] };
      const goalsData = goalsResponse.ok ? await goalsResponse.json() : { data: [] };

      setReportData({
        bloodPressure: bpData.data || [],
        weight: weightData.data || [],
        bloodWork: bloodWorkData.data || [],
        doctorVisits: doctorVisitsData.data || [],
        goals: goalsData.data || []
      });
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
        charts: reportConfig.includeCharts ? generateChartData() : null
      };

      // Export based on format
      if (reportConfig.format === 'json') {
        exportAsJSON(reportContent);
      } else if (reportConfig.format === 'csv') {
        exportAsCSV(reportContent);
      } else {
        exportAsPDF(reportContent);
      }

      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSummary = () => {
    const totalRecords = 
      reportData.bloodPressure.length + 
      reportData.weight.length + 
      reportData.bloodWork.length + 
      reportData.doctorVisits.length + 
      reportData.goals.length;

    const completedGoals = reportData.goals.filter((goal: any) => goal.status === 'completed').length;
    const activeGoals = reportData.goals.filter((goal: any) => goal.status === 'active').length;

    return {
      totalRecords,
      bloodPressureReadings: reportData.bloodPressure.length,
      weightRecords: reportData.weight.length,
      bloodWorkTests: reportData.bloodWork.length,
      doctorVisits: reportData.doctorVisits.length,
      goals: {
        total: reportData.goals.length,
        completed: completedGoals,
        active: activeGoals,
        overdue: reportData.goals.filter((goal: any) => goal.status === 'overdue').length
      }
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

    return {
      bloodPressure: reportData.bloodPressure.filter((record: any) => 
        new Date(record.date) >= daysAgo
      ),
      weight: reportData.weight.filter((record: any) => 
        new Date(record.date) >= daysAgo
      ),
      bloodWork: reportData.bloodWork.filter((record: any) => 
        new Date(record.testDate) >= daysAgo
      ),
      doctorVisits: reportData.doctorVisits.filter((record: any) => 
        new Date(record.visitDate) >= daysAgo
      ),
      goals: reportData.goals.filter((record: any) => 
        new Date(record.createdAt) >= daysAgo
      )
    };
  };

  const generateChartData = () => {
    // Generate chart data for visualization
    return {
      bloodPressure: {
        labels: reportData.bloodPressure.slice(0, 10).map((record: any) => 
          new Date(record.date).toLocaleDateString()
        ),
        systolic: reportData.bloodPressure.slice(0, 10).map((record: any) => record.systolic),
        diastolic: reportData.bloodPressure.slice(0, 10).map((record: any) => record.diastolic)
      },
      weight: {
        labels: reportData.weight.slice(0, 10).map((record: any) => 
          new Date(record.date).toLocaleDateString()
        ),
        values: reportData.weight.slice(0, 10).map((record: any) => record.weight)
      }
    };
  };

  const exportAsJSON = (content: any) => {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = (content: any) => {
    // Convert data to CSV format
    let csvContent = 'Data Type,Date,Value,Notes\n';
    
    // Add blood pressure data
    content.data.bloodPressure.forEach((record: any) => {
      csvContent += `Blood Pressure,${record.date},${record.systolic}/${record.diastolic} mmHg,${record.notes || ''}\n`;
    });
    
    // Add weight data
    content.data.weight.forEach((record: any) => {
      csvContent += `Weight,${record.date},${record.weight} ${record.unit},${record.notes || ''}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = (content: any) => {
    // For now, we'll create a simple text-based PDF simulation
    // In a real implementation, you'd use a library like jsPDF
    const pdfContent = `
MyHealthFirst Health Report
Generated: ${new Date().toLocaleDateString()}
Date Range: ${reportConfig.dateRange}

Summary:
- Total Records: ${content.summary.totalRecords}
- Blood Pressure Readings: ${content.summary.bloodPressureReadings}
- Weight Records: ${content.summary.weightRecords}
- Blood Work Tests: ${content.summary.bloodWorkTests}
- Doctor Visits: ${content.summary.doctorVisits}
- Goals: ${content.summary.goals.total} (${content.summary.goals.completed} completed)

Detailed Data:
${content.data.bloodPressure.map((record: any) => 
  `Blood Pressure: ${record.systolic}/${record.diastolic} mmHg on ${new Date(record.date).toLocaleDateString()}`
).join('\n')}

${content.data.weight.map((record: any) => 
  `Weight: ${record.weight} ${record.unit} on ${new Date(record.date).toLocaleDateString()}`
).join('\n')}
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'bloodPressure':
        return <Activity className="h-4 w-4 text-red-500" />;
      case 'weight':
        return <Scale className="h-4 w-4 text-orange-500" />;
      case 'bloodWork':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'doctorVisits':
        return <Stethoscope className="h-4 w-4 text-green-500" />;
      case 'goals':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
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
                { key: 'goals', label: 'Health Goals', icon: <TrendingUp className="h-4 w-4" /> }
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
              <Select value={reportConfig.format} onValueChange={(value: any) => setReportConfig({ ...reportConfig, format: value })}>
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

            <div>
              <label className="text-sm font-medium">Options</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={reportConfig.includeCharts}
                    onCheckedChange={(checked) => setReportConfig({ ...reportConfig, includeCharts: !!checked })}
                  />
                  <label htmlFor="includeCharts" className="text-sm">Include charts</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeSummary"
                    checked={reportConfig.includeSummary}
                    onCheckedChange={(checked) => setReportConfig({ ...reportConfig, includeSummary: !!checked })}
                  />
                  <label htmlFor="includeSummary" className="text-sm">Include summary</label>
                </div>
              </div>
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
                Generating Report...
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>

      {/* Quick Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <File className="h-5 w-5 text-red-500" />
              <span>Quick PDF Report</span>
            </CardTitle>
            <CardDescription>
              Generate a comprehensive PDF report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setReportConfig({ ...reportConfig, format: 'pdf' });
                generateReport();
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-green-500" />
              <span>Data Export</span>
            </CardTitle>
            <CardDescription>
              Export raw data in CSV format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setReportConfig({ ...reportConfig, format: 'csv' });
                generateReport();
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileJson className="h-5 w-5 text-blue-500" />
              <span>JSON Export</span>
            </CardTitle>
            <CardDescription>
              Export data in JSON format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setReportConfig({ ...reportConfig, format: 'json' });
                generateReport();
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 