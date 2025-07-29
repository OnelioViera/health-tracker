"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertTriangle, Calendar, BarChart3, LineChart, PieChart, Download, Scale, Target, Clock, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BackButton from "@/components/back-button";
import { Label } from "@/components/ui/label";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface WeightRecord {
  _id: string;
  weight: number;
  height?: number;
  unit: string;
  heightUnit?: string;
  date: string;
  notes?: string;
}

interface BMIRange {
  underweight: { min: number; max: number };
  normal: { min: number; max: number };
  overweight: { min: number; max: number };
  obese: { min: number; max: number };
}

export default function WeightTrendsPage() {
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('weight'); // weight, bmi, both

  // Fetch weight records from MongoDB
  const fetchWeightRecords = async () => {
    try {
      const response = await fetch('/api/weight');
      if (response.ok) {
        const data = await response.json();
        setWeightRecords(data.data || []);
      } else {
        console.error('Failed to fetch weight records');
      }
    } catch (error) {
      console.error('Error fetching weight records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightRecords();
  }, []);

  // Filter records based on time range
  const getFilteredRecords = () => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
    
    return weightRecords.filter(record => 
      new Date(record.date) >= daysAgo
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const filteredRecords = getFilteredRecords();

  // Calculate BMI
  const calculateBMI = (weight: number, height: number, weightUnit: string, heightUnit: string) => {
    let heightInMeters, weightInKg;
    
    // Convert height to meters
    if (heightUnit === 'in') {
      heightInMeters = height * 0.0254; // inches to meters
    } else {
      heightInMeters = height / 100; // cm to meters
    }
    
    // Convert weight to kg
    if (weightUnit === 'lbs') {
      weightInKg = weight * 0.453592; // lbs to kg
    } else {
      weightInKg = weight; // already in kg
    }
    
    return weightInKg / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'info' };
    if (bmi < 25) return { category: 'Normal', color: 'success' };
    if (bmi < 30) return { category: 'Overweight', color: 'warning' };
    return { category: 'Obese', color: 'danger' };
  };

  // Calculate trends
  const calculateTrends = () => {
    if (filteredRecords.length < 2) return null;

    const firstHalf = filteredRecords.slice(0, Math.floor(filteredRecords.length / 2));
    const secondHalf = filteredRecords.slice(Math.floor(filteredRecords.length / 2));

    const firstAvgWeight = firstHalf.reduce((sum, r) => sum + r.weight, 0) / firstHalf.length;
    const secondAvgWeight = secondHalf.reduce((sum, r) => sum + r.weight, 0) / secondHalf.length;

    // Calculate BMI trends if height data is available
    let bmiTrend = null;
    const recordsWithHeight = filteredRecords.filter(r => r.height);
    if (recordsWithHeight.length >= 2) {
      const firstHalfBMI = recordsWithHeight.slice(0, Math.floor(recordsWithHeight.length / 2));
      const secondHalfBMI = recordsWithHeight.slice(Math.floor(recordsWithHeight.length / 2));
      
      const firstAvgBMI = firstHalfBMI.reduce((sum, r) => {
        return sum + calculateBMI(r.weight, r.height!, r.unit, r.heightUnit || 'in');
      }, 0) / firstHalfBMI.length;
      
      const secondAvgBMI = secondHalfBMI.reduce((sum, r) => {
        return sum + calculateBMI(r.weight, r.height!, r.unit, r.heightUnit || 'in');
      }, 0) / secondHalfBMI.length;
      
      bmiTrend = {
        change: secondAvgBMI - firstAvgBMI,
        trend: secondAvgBMI > firstAvgBMI ? 'up' : 'down'
      };
    }

    return {
      weight: {
        change: secondAvgWeight - firstAvgWeight,
        trend: secondAvgWeight > firstAvgWeight ? 'up' : 'down'
      },
      bmi: bmiTrend
    };
  };

  const trends = calculateTrends();

  // Calculate BMI distribution
  const getBMIDistribution = () => {
    const distribution = {
      underweight: 0,
      normal: 0,
      overweight: 0,
      obese: 0
    };

    filteredRecords.forEach(record => {
      if (record.height) {
        const bmi = calculateBMI(record.weight, record.height, record.unit, record.heightUnit || 'in');
        const category = getBMICategory(bmi).category.toLowerCase();
        distribution[category as keyof typeof distribution]++;
      }
    });

    return distribution;
  };

  const bmiDistribution = getBMIDistribution();

  // Calculate averages
  const getAverages = () => {
    if (filteredRecords.length === 0) return null;

    const totalWeight = filteredRecords.reduce((sum, r) => sum + r.weight, 0);
    const recordsWithHeight = filteredRecords.filter(r => r.height);
    
    let avgBMI = null;
    if (recordsWithHeight.length > 0) {
      const totalBMI = recordsWithHeight.reduce((sum, r) => {
        return sum + calculateBMI(r.weight, r.height!, r.unit, r.heightUnit || 'in');
      }, 0);
      avgBMI = totalBMI / recordsWithHeight.length;
    }

    return {
      avgWeight: Math.round(totalWeight / filteredRecords.length * 10) / 10,
      avgBMI: avgBMI ? Math.round(avgBMI * 10) / 10 : null,
      totalRecords: filteredRecords.length,
      recordsWithHeight: recordsWithHeight.length
    };
  };

  const averages = getAverages();

  // Calculate recording frequency
  const getRecordingFrequency = () => {
    if (filteredRecords.length === 0) return 0;
    const daysInRange = parseInt(timeRange);
    const weeksInRange = daysInRange / 7;
    return Math.round((filteredRecords.length / weeksInRange) * 10) / 10;
  };

  const recordingFrequency = getRecordingFrequency();

  // Get time-based patterns
  const getTimePatterns = () => {
    const morningRecords = filteredRecords.filter(r => {
      const hour = new Date(r.date).getHours();
      return hour >= 6 && hour < 12;
    });
    
    const afternoonRecords = filteredRecords.filter(r => {
      const hour = new Date(r.date).getHours();
      return hour >= 12 && hour < 18;
    });
    
    const eveningRecords = filteredRecords.filter(r => {
      const hour = new Date(r.date).getHours();
      return hour >= 18 || hour < 6;
    });

    return {
      morning: morningRecords.length,
      afternoon: afternoonRecords.length,
      evening: eveningRecords.length,
      total: filteredRecords.length
    };
  };

  const timePatterns = getTimePatterns();

  // Get records with notes
  const getRecordsWithNotes = () => {
    return filteredRecords.filter(r => r.notes && r.notes.trim() !== '').length;
  };

  const recordsWithNotes = getRecordsWithNotes();

  // Get weight range analysis
  const getWeightRangeAnalysis = () => {
    if (filteredRecords.length === 0) return null;

    const weights = filteredRecords.map(r => r.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const range = maxWeight - minWeight;

    return {
      min: minWeight,
      max: maxWeight,
      range: range,
      average: averages?.avgWeight
    };
  };

  const weightRangeAnalysis = getWeightRangeAnalysis();

  // Prepare chart data
  const getLineChartData = () => {
    const labels = filteredRecords.map(record => 
      new Date(record.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    const weightData = filteredRecords.map(record => record.weight);
    const bmiData = filteredRecords.map(record => {
      if (record.height) {
        return calculateBMI(record.weight, record.height, record.unit, record.heightUnit || 'in');
      }
      return null;
    }).filter(bmi => bmi !== null);

    const datasets = [
      {
        label: 'Weight',
        data: weightData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ];

    if (bmiData.length > 0) {
      datasets.push({
        label: 'BMI',
        data: bmiData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      });
    }

    return {
      labels,
      datasets
    };
  };

  const getPieChartData = () => {
    const data = [
      bmiDistribution.underweight,
      bmiDistribution.normal,
      bmiDistribution.overweight,
      bmiDistribution.obese
    ];

    return {
      labels: ['Underweight', 'Normal', 'Overweight', 'Obese'],
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)', // Blue for underweight
            'rgba(34, 197, 94, 0.8)', // Green for normal
            'rgba(245, 158, 11, 0.8)', // Yellow for overweight
            'rgba(239, 68, 68, 0.8)', // Red for obese
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(34, 197, 94)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const lineChartData = getLineChartData();
  const pieChartData = getPieChartData();

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Weight (lbs/kg) / BMI',
        },
      }
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 mx-auto animate-spin text-blue-500 mb-4" />
            <p>Loading weight trends...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weight Trends</h1>
          <p className="text-gray-600">Comprehensive analysis of your weight and BMI data</p>
        </div>
        <BackButton />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="timeRange" className="text-sm font-medium">Time Range:</Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="metric" className="text-sm font-medium">Metric:</Label>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weight">Weight</SelectItem>
              <SelectItem value="bmi">BMI</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Last {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recording Frequency</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordingFrequency}</div>
            <p className="text-xs text-muted-foreground">
              records per week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Weight</CardTitle>
            <Scale className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averages ? `${averages.avgWeight}` : 'No data'}
            </div>
            <p className="text-xs text-muted-foreground">
              lbs/kg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trends ? (
                <span className={trends.weight.trend === 'up' ? 'text-red-600' : 'text-green-600'}>
                  {trends.weight.trend === 'up' ? '↗' : '↘'}
                </span>
              ) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {trends ? `${Math.abs(trends.weight.change).toFixed(1)} lbs` : 'No trend'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* BMI Analysis */}
        {averages?.avgBMI && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average BMI</CardTitle>
              <Target className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averages.avgBMI}</div>
              <p className="text-xs text-muted-foreground">
                {getBMICategory(averages.avgBMI).category}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Weight Range */}
        {weightRangeAnalysis && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weight Range</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weightRangeAnalysis.range.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                {weightRangeAnalysis.min} - {weightRangeAnalysis.max}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Time Patterns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recording Times</CardTitle>
            <Clock className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Morning:</span>
                <span className="font-medium">{timePatterns.morning}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Afternoon:</span>
                <span className="font-medium">{timePatterns.afternoon}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Evening:</span>
                <span className="font-medium">{timePatterns.evening}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes Analysis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordsWithNotes}</div>
            <p className="text-xs text-muted-foreground">
              {filteredRecords.length > 0 ? `${Math.round((recordsWithNotes / filteredRecords.length) * 100)}% of records` : 'No records'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5" />
              <span>Weight Over Time</span>
            </CardTitle>
            <CardDescription>
              Weight and BMI readings over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRecords.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">Weight:</span>
                    <span className="ml-2">Range {Math.min(...filteredRecords.map(r => r.weight)).toFixed(1)} - {Math.max(...filteredRecords.map(r => r.weight)).toFixed(1)} lbs</span>
                  </div>
                  {averages?.avgBMI && (
                    <div>
                      <span className="text-red-600 font-medium">BMI:</span>
                      <span className="ml-2">Average {averages.avgBMI}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <LineChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No records in selected time range</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BMI Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>BMI Categories</span>
            </CardTitle>
            <CardDescription>
              Distribution of BMI categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRecords.some(r => r.height) ? (
              <div className="space-y-4">
                <div className="h-64">
                  <Pie data={pieChartData} options={pieChartOptions} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Underweight</span>
                    <Badge variant="info">
                      {bmiDistribution.underweight} ({Math.round((bmiDistribution.underweight / filteredRecords.filter(r => r.height).length) * 100)}%)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Normal</span>
                    <Badge variant="success">
                      {bmiDistribution.normal} ({Math.round((bmiDistribution.normal / filteredRecords.filter(r => r.height).length) * 100)}%)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overweight</span>
                    <Badge variant="warning">
                      {bmiDistribution.overweight} ({Math.round((bmiDistribution.overweight / filteredRecords.filter(r => r.height).length) * 100)}%)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Obese</span>
                    <Badge variant="danger">
                      {bmiDistribution.obese} ({Math.round((bmiDistribution.obese / filteredRecords.filter(r => r.height).length) * 100)}%)
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No height data available for BMI calculation</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Trend Insights</span>
          </CardTitle>
          <CardDescription>
            AI-powered insights about your weight patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">📊 Recording Pattern</h4>
                <p className="text-sm text-blue-800">
                  You&apos;re recording weight {recordingFrequency} times per week on average. 
                  {recordingFrequency >= 2 ? ' This is a good frequency for monitoring.' : ' Consider increasing frequency for better tracking.'}
                </p>
              </div>

              {trends && (
                <div className={`p-4 rounded-lg border ${
                  trends.weight.trend === 'up' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    trends.weight.trend === 'up' ? 'text-red-900' : 'text-green-900'
                  }`}>
                    📈 Weight Trend
                  </h4>
                  <p className={`text-sm ${
                    trends.weight.trend === 'up' ? 'text-red-800' : 'text-green-800'
                  }`}>
                    Your weight has been trending {trends.weight.trend === 'up' ? 'upward' : 'downward'} 
                    by {Math.abs(trends.weight.change).toFixed(1)} lbs over this period.
                    {trends.weight.trend === 'up' ? ' Consider dietary and exercise adjustments.' : ' Keep up the good work!'}
                  </p>
                </div>
              )}

              {averages?.avgBMI && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">🎯 BMI Analysis</h4>
                  <p className="text-sm text-purple-800">
                    Your average BMI is {averages.avgBMI} ({getBMICategory(averages.avgBMI).category}).
                    {averages.avgBMI < 18.5 ? ' Consider consulting a nutritionist.' : 
                     averages.avgBMI > 30 ? ' Consider lifestyle changes and medical consultation.' : 
                     ' This is within a healthy range.'}
                  </p>
                </div>
              )}

              {timePatterns.total > 0 && (
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="font-medium text-indigo-900 mb-2">⏰ Recording Time Patterns</h4>
                  <p className="text-sm text-indigo-800">
                    You take most recordings in the {timePatterns.morning > timePatterns.afternoon && timePatterns.morning > timePatterns.evening ? 'morning' : 
                    timePatterns.afternoon > timePatterns.evening ? 'afternoon' : 'evening'}.
                    Consider recording at consistent times for better tracking.
                  </p>
                </div>
              )}

              {weightRangeAnalysis && weightRangeAnalysis.range > 10 && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-900 mb-2">⚠️ Weight Variability</h4>
                  <p className="text-sm text-orange-800">
                    Your weight has varied by {weightRangeAnalysis.range.toFixed(1)} lbs. 
                    This could be due to normal fluctuations, but consider monitoring more consistently.
                  </p>
                </div>
              )}

              {recordsWithNotes > 0 && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-900 mb-2">📝 Notes Analysis</h4>
                  <p className="text-sm text-amber-800">
                    You&apos;ve added notes to {recordsWithNotes} recordings ({Math.round((recordsWithNotes / filteredRecords.length) * 100)}%).
                    This helps track patterns and triggers. Keep it up!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No records available for insights</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Personalized suggestions based on your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Monitoring Frequency</h4>
                <p className="text-sm text-gray-600">
                  {recordingFrequency < 2 ? 'Increase monitoring to 2-3 times per week for better tracking.' : 'Your monitoring frequency is good.'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Lifestyle</h4>
                <p className="text-sm text-gray-600">
                  Maintain a balanced diet, regular exercise, and consistent sleep patterns.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">BMI Management</h4>
                <p className="text-sm text-gray-600">
                  {averages?.avgBMI ? 
                    (averages.avgBMI < 18.5 ? 'Consider increasing caloric intake and strength training.' :
                     averages.avgBMI > 30 ? 'Focus on gradual weight loss through diet and exercise.' :
                     'Maintain your current healthy lifestyle.') : 
                    'Add height data to track BMI trends.'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Documentation</h4>
                <p className="text-sm text-gray-600">
                  {recordsWithNotes < filteredRecords.length * 0.5 ? 'Consider adding notes to more recordings to track patterns.' : 'Good job documenting your recordings!'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Medical Follow-up</h4>
                <p className="text-sm text-gray-600">
                  {averages?.avgBMI && (averages.avgBMI < 18.5 || averages.avgBMI > 30) 
                    ? 'Schedule a consultation with a healthcare provider or nutritionist.' 
                    : 'Continue regular check-ups as recommended.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 