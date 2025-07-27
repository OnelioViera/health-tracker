"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertTriangle, Calendar, BarChart3, LineChart, PieChart, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BackButton from "@/components/back-button";

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

  // Calculate averages
  const getAverages = () => {
    if (filteredReadings.length === 0) return null;

    const avgSystolic = Math.round(filteredReadings.reduce((sum, r) => sum + r.systolic, 0) / filteredReadings.length);
    const avgDiastolic = Math.round(filteredReadings.reduce((sum, r) => sum + r.diastolic, 0) / filteredReadings.length);
    const avgPulse = filteredReadings.filter(r => r.pulse).length > 0 
      ? Math.round(filteredReadings.filter(r => r.pulse).reduce((sum, r) => sum + (r.pulse || 0), 0) / filteredReadings.filter(r => r.pulse).length)
      : null;

    return { avgSystolic, avgDiastolic, avgPulse };
  };

  const averages = getAverages();

  // Get reading frequency
  const getReadingFrequency = () => {
    if (filteredReadings.length === 0) return 0;
    
    const days = parseInt(timeRange);
    return Math.round((filteredReadings.length / days) * 7); // readings per week
  };

  const readingFrequency = getReadingFrequency();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blood Pressure Trends</h1>
            <p className="text-gray-600">Analyze your blood pressure patterns and insights</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading trends...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Blood Pressure Trends</h1>
            <p className="text-gray-600">Analyze your blood pressure patterns and insights</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Time Range:</span>
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
          <span className="text-sm font-medium">Metric:</span>
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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Chart visualization would go here</p>
                    <p className="text-sm text-gray-400">Showing {filteredReadings.length} readings</p>
                  </div>
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
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Pie chart would go here</p>
                  </div>
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

              {averages && averages.avgPulse && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">💓 Heart Rate</h4>
                  <p className="text-sm text-purple-800">
                    Your average heart rate is {averages.avgPulse} bpm. 
                    {averages.avgPulse > 100 ? ' Consider stress management techniques.' : ' This is within normal range.'}
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