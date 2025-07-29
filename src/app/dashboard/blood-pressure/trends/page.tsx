"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertTriangle, Calendar, BarChart3, LineChart, PieChart, Download, Heart, FileText, Clock } from "lucide-react";
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

interface BloodPressureReading {
  _id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  date: string;
  notes?: string;
  category: 'normal' | 'elevated' | 'high' | 'crisis';
}

export default function BloodPressureTrendsPage() {
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('both'); // systolic, diastolic, both

  // Fetch readings from MongoDB
  const fetchReadings = async () => {
    try {
      const response = await fetch('/api/blood-pressure');
      if (response.ok) {
        const data = await response.json();
        setReadings(data.data || []);
      } else {
        console.error('Failed to fetch readings');
      }
    } catch (error) {
      console.error('Error fetching readings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  // Filter readings based on time range
  const getFilteredReadings = () => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
    
    return readings.filter(reading => 
      new Date(reading.date) >= daysAgo
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const filteredReadings = getFilteredReadings();

  // Calculate trends
  const calculateTrends = () => {
    if (filteredReadings.length < 2) return null;

    const firstHalf = filteredReadings.slice(0, Math.floor(filteredReadings.length / 2));
    const secondHalf = filteredReadings.slice(Math.floor(filteredReadings.length / 2));

    const firstAvgSystolic = firstHalf.reduce((sum, r) => sum + r.systolic, 0) / firstHalf.length;
    const secondAvgSystolic = secondHalf.reduce((sum, r) => sum + r.systolic, 0) / secondHalf.length;
    const firstAvgDiastolic = firstHalf.reduce((sum, r) => sum + r.diastolic, 0) / firstHalf.length;
    const secondAvgDiastolic = secondHalf.reduce((sum, r) => sum + r.diastolic, 0) / secondHalf.length;

    return {
      systolic: {
        change: secondAvgSystolic - firstAvgSystolic,
        trend: secondAvgSystolic > firstAvgSystolic ? 'up' : 'down'
      },
      diastolic: {
        change: secondAvgDiastolic - firstAvgDiastolic,
        trend: secondAvgDiastolic > firstAvgDiastolic ? 'up' : 'down'
      }
    };
  };

  const trends = calculateTrends();

  // Calculate category distribution
  const getCategoryDistribution = () => {
    const distribution = {
      normal: 0,
      elevated: 0,
      high: 0,
      crisis: 0
    };

    filteredReadings.forEach(reading => {
      distribution[reading.category]++;
    });

    return distribution;
  };

  const categoryDistribution = getCategoryDistribution();

  // Calculate averages including pulse
  const getAverages = () => {
    if (filteredReadings.length === 0) return null;

    const totalSystolic = filteredReadings.reduce((sum, r) => sum + r.systolic, 0);
    const totalDiastolic = filteredReadings.reduce((sum, r) => sum + r.diastolic, 0);
    const pulseReadings = filteredReadings.filter(r => r.pulse !== undefined);
    const totalPulse = pulseReadings.reduce((sum, r) => sum + (r.pulse || 0), 0);

    return {
      avgSystolic: Math.round(totalSystolic / filteredReadings.length),
      avgDiastolic: Math.round(totalDiastolic / filteredReadings.length),
      avgPulse: pulseReadings.length > 0 ? Math.round(totalPulse / pulseReadings.length) : null,
      totalReadings: filteredReadings.length,
      readingsWithPulse: pulseReadings.length
    };
  };

  const averages = getAverages();

  // Calculate reading frequency
  const getReadingFrequency = () => {
    if (filteredReadings.length === 0) return 0;
    const daysInRange = parseInt(timeRange);
    const weeksInRange = daysInRange / 7;
    return Math.round((filteredReadings.length / weeksInRange) * 10) / 10;
  };

  const readingFrequency = getReadingFrequency();

  // Get time-based patterns
  const getTimePatterns = () => {
    const morningReadings = filteredReadings.filter(r => {
      const hour = new Date(r.date).getHours();
      return hour >= 6 && hour < 12;
    });
    
    const afternoonReadings = filteredReadings.filter(r => {
      const hour = new Date(r.date).getHours();
      return hour >= 12 && hour < 18;
    });
    
    const eveningReadings = filteredReadings.filter(r => {
      const hour = new Date(r.date).getHours();
      return hour >= 18 || hour < 6;
    });

    return {
      morning: morningReadings.length,
      afternoon: afternoonReadings.length,
      evening: eveningReadings.length,
      total: filteredReadings.length
    };
  };

  const timePatterns = getTimePatterns();

  // Get readings with notes
  const getReadingsWithNotes = () => {
    return filteredReadings.filter(r => r.notes && r.notes.trim() !== '').length;
  };

  const readingsWithNotes = getReadingsWithNotes();

  // Get pulse analysis
  const getPulseAnalysis = () => {
    const pulseReadings = filteredReadings.filter(r => r.pulse !== undefined);
    if (pulseReadings.length === 0) return null;

    const avgPulse = pulseReadings.reduce((sum, r) => sum + (r.pulse || 0), 0) / pulseReadings.length;
    const minPulse = Math.min(...pulseReadings.map(r => r.pulse || 0));
    const maxPulse = Math.max(...pulseReadings.map(r => r.pulse || 0));

    return {
      average: Math.round(avgPulse),
      min: minPulse,
      max: maxPulse,
      range: maxPulse - minPulse
    };
  };

  const pulseAnalysis = getPulseAnalysis();

  // Prepare chart data
  const getLineChartData = () => {
    const labels = filteredReadings.map(reading => 
      new Date(reading.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    const systolicData = filteredReadings.map(reading => reading.systolic);
    const diastolicData = filteredReadings.map(reading => reading.diastolic);

    return {
      labels,
      datasets: [
        {
          label: 'Systolic',
          data: systolicData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Diastolic',
          data: diastolicData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  };

  const getPieChartData = () => {
    const data = [
      categoryDistribution.normal,
      categoryDistribution.elevated,
      categoryDistribution.high,
      categoryDistribution.crisis
    ];

    return {
      labels: ['Normal', 'Elevated', 'High', 'Crisis'],
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)', // Green for normal
            'rgba(245, 158, 11, 0.8)', // Yellow for elevated
            'rgba(239, 68, 68, 0.8)', // Red for high
            'rgba(220, 38, 38, 0.8)', // Dark red for crisis
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(220, 38, 38)',
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
          text: 'Blood Pressure (mmHg)',
        },
        min: Math.min(...filteredReadings.map(r => r.diastolic)) - 10,
        max: Math.max(...filteredReadings.map(r => r.systolic)) + 10,
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
            <p>Loading blood pressure trends...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blood Pressure Trends</h1>
          <p className="text-gray-600">Comprehensive analysis of your blood pressure data</p>
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
              <SelectItem value="both">Both</SelectItem>
              <SelectItem value="systolic">Systolic</SelectItem>
              <SelectItem value="diastolic">Diastolic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredReadings.length}</div>
            <p className="text-xs text-muted-foreground">
              Last {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Frequency</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readingFrequency}</div>
            <p className="text-xs text-muted-foreground">
              readings per week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average BP</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averages ? `${averages.avgSystolic}/${averages.avgDiastolic}` : 'No data'}
            </div>
            <p className="text-xs text-muted-foreground">
              mmHg
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
                <span className={trends.systolic.trend === 'up' ? 'text-red-600' : 'text-green-600'}>
                  {trends.systolic.trend === 'up' ? '↗' : '↘'}
                </span>
              ) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {trends ? `${Math.abs(trends.systolic.change).toFixed(1)} mmHg` : 'No trend'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pulse Analysis */}
        {pulseAnalysis && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pulseAnalysis.average} bpm</div>
              <p className="text-xs text-muted-foreground">
                Range: {pulseAnalysis.min}-{pulseAnalysis.max} bpm
              </p>
            </CardContent>
          </Card>
        )}

        {/* Time Patterns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Times</CardTitle>
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
            <div className="text-2xl font-bold">{readingsWithNotes}</div>
            <p className="text-xs text-muted-foreground">
              {filteredReadings.length > 0 ? `${Math.round((readingsWithNotes / filteredReadings.length) * 100)}% of readings` : 'No readings'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Pressure Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5" />
              <span>Blood Pressure Over Time</span>
            </CardTitle>
            <CardDescription>
              Systolic and diastolic readings over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReadings.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-red-600 font-medium">Systolic:</span>
                    <span className="ml-2">Range {Math.min(...filteredReadings.map(r => r.systolic))} - {Math.max(...filteredReadings.map(r => r.systolic))} mmHg</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Diastolic:</span>
                    <span className="ml-2">Range {Math.min(...filteredReadings.map(r => r.diastolic))} - {Math.max(...filteredReadings.map(r => r.diastolic))} mmHg</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <LineChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No readings in selected time range</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Reading Categories</span>
            </CardTitle>
            <CardDescription>
              Distribution of blood pressure categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReadings.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64">
                  <Pie data={pieChartData} options={pieChartOptions} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Normal</span>
                    <Badge variant="success">
                      {categoryDistribution.normal} ({Math.round((categoryDistribution.normal / filteredReadings.length) * 100)}%)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Elevated</span>
                    <Badge variant="warning">
                      {categoryDistribution.elevated} ({Math.round((categoryDistribution.elevated / filteredReadings.length) * 100)}%)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High</span>
                    <Badge variant="danger">
                      {categoryDistribution.high} ({Math.round((categoryDistribution.high / filteredReadings.length) * 100)}%)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Crisis</span>
                    <Badge variant="danger">
                      {categoryDistribution.crisis} ({Math.round((categoryDistribution.crisis / filteredReadings.length) * 100)}%)
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No readings in selected time range</p>
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
            AI-powered insights about your blood pressure patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReadings.length > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">📊 Reading Pattern</h4>
                <p className="text-sm text-blue-800">
                  You&apos;re taking readings {readingFrequency} times per week on average. 
                  {readingFrequency >= 3 ? ' This is a good frequency for monitoring.' : ' Consider increasing frequency for better tracking.'}
                </p>
              </div>

              {trends && (
                <div className={`p-4 rounded-lg border ${
                  trends.systolic.trend === 'up' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    trends.systolic.trend === 'up' ? 'text-red-900' : 'text-green-900'
                  }`}>
                    📈 Trend Analysis
                  </h4>
                  <p className={`text-sm ${
                    trends.systolic.trend === 'up' ? 'text-red-800' : 'text-green-800'
                  }`}>
                    Your blood pressure has been trending {trends.systolic.trend === 'up' ? 'upward' : 'downward'} 
                    by {Math.abs(trends.systolic.change).toFixed(1)} mmHg over this period.
                    {trends.systolic.trend === 'up' ? ' Consider lifestyle changes or consult your doctor.' : ' Keep up the good work!'}
                  </p>
                </div>
              )}

              {pulseAnalysis && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">💓 Heart Rate Analysis</h4>
                  <p className="text-sm text-purple-800">
                    Your average heart rate is {pulseAnalysis.average} bpm with a range of {pulseAnalysis.range} bpm.
                    {pulseAnalysis.average > 100 ? ' Consider stress management and relaxation techniques.' : ' This is within normal range.'}
                  </p>
                </div>
              )}

              {timePatterns.total > 0 && (
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="font-medium text-indigo-900 mb-2">⏰ Reading Time Patterns</h4>
                  <p className="text-sm text-indigo-800">
                    You take most readings in the {timePatterns.morning > timePatterns.afternoon && timePatterns.morning > timePatterns.evening ? 'morning' : 
                    timePatterns.afternoon > timePatterns.evening ? 'afternoon' : 'evening'}.
                    Consider taking readings at consistent times for better tracking.
                  </p>
                </div>
              )}

              {categoryDistribution.high > 0 || categoryDistribution.crisis > 0 ? (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-900 mb-2">⚠️ Elevated Readings</h4>
                  <p className="text-sm text-orange-800">
                    You have {categoryDistribution.high + categoryDistribution.crisis} elevated or high readings. 
                    Consider monitoring more frequently and consult your healthcare provider.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">✅ Good Control</h4>
                  <p className="text-sm text-green-800">
                    All your readings are in the normal or elevated range. Keep maintaining your current lifestyle!
                  </p>
                </div>
              )}

              {readingsWithNotes > 0 && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-900 mb-2">📝 Notes Analysis</h4>
                  <p className="text-sm text-amber-800">
                    You&apos;ve added notes to {readingsWithNotes} readings ({Math.round((readingsWithNotes / filteredReadings.length) * 100)}%).
                    This helps track patterns and triggers. Keep it up!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No readings available for insights</p>
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
                  {readingFrequency < 3 ? 'Increase monitoring to 2-3 times per week for better tracking.' : 'Your monitoring frequency is good.'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Lifestyle</h4>
                <p className="text-sm text-gray-600">
                  Maintain a healthy diet, regular exercise, and stress management techniques.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Heart Rate</h4>
                <p className="text-sm text-gray-600">
                  {pulseAnalysis && pulseAnalysis.average > 100 ? 'Consider stress management and relaxation techniques.' : 'Your heart rate is within normal range.'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Documentation</h4>
                <p className="text-sm text-gray-600">
                  {readingsWithNotes < filteredReadings.length * 0.5 ? 'Consider adding notes to more readings to track patterns.' : 'Good job documenting your readings!'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Medical Follow-up</h4>
                <p className="text-sm text-gray-600">
                  {categoryDistribution.high > 0 || categoryDistribution.crisis > 0 
                    ? 'Schedule a follow-up with your healthcare provider.' 
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