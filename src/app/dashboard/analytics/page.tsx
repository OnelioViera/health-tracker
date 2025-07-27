"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Scale, 
  Thermometer,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import BackButton from "@/components/back-button";
import Link from "next/link";

interface BloodPressureData {
  _id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  date: string;
  category: string;
  notes?: string;
}

interface WeightData {
  _id: string;
  weight: number;
  height: number;
  unit: string;
  heightUnit: string;
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

interface HealthMetrics {
  name: string;
  current: string;
  previous: string;
  trend: "up" | "down" | "stable";
  status: "normal" | "improving" | "warning" | "critical";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface Insight {
  title: string;
  description: string;
  type: "positive" | "warning" | "reminder";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [bloodPressureData, setBloodPressureData] = useState<BloodPressureData[]>([]);
  const [weightData, setWeightData] = useState<WeightData[]>([]);
  const [bloodWorkData, setBloodWorkData] = useState<BloodWorkData[]>([]);
  const [doctorVisitsData, setDoctorVisitsData] = useState<DoctorVisitData[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [bpResponse, weightResponse, bloodWorkResponse, doctorVisitsResponse] = await Promise.all([
        fetch('/api/blood-pressure'),
        fetch('/api/weight'),
        fetch('/api/blood-work'),
        fetch('/api/doctor-visits')
      ]);

      const bpData = await bpResponse.json();
      const weightData = await weightResponse.json();
      const bloodWorkData = await bloodWorkResponse.json();
      const doctorVisitsData = await doctorVisitsResponse.json();

      setBloodPressureData(bpData.data || []);
      setWeightData(weightData.data || []);
      setBloodWorkData(bloodWorkData.data || []);
      setDoctorVisitsData(doctorVisitsData.data || []);

      // Calculate health metrics from real data
      calculateHealthMetrics(bpData.data || [], weightData.data || []);
      
      // Generate insights from real data
      generateInsights(bpData.data || [], weightData.data || [], bloodWorkData.data || [], doctorVisitsData.data || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const calculateHealthMetrics = (bpData: BloodPressureData[], weightData: WeightData[]) => {
    const metrics: HealthMetrics[] = [];

    // Blood Pressure Metrics
    if (bpData.length > 0) {
      const latest = bpData[0];
      const previous = bpData[1];
      
      const currentBP = `${latest.systolic}/${latest.diastolic}`;
      const previousBP = previous ? `${previous.systolic}/${previous.diastolic}` : "N/A";
      
      let trend: "up" | "down" | "stable" = "stable";
      let status: "normal" | "improving" | "warning" | "critical" = "normal";
      
      if (previous) {
        const currentAvg = (latest.systolic + latest.diastolic) / 2;
        const previousAvg = (previous.systolic + previous.diastolic) / 2;
        trend = currentAvg < previousAvg ? "down" : currentAvg > previousAvg ? "up" : "stable";
      }

      // Determine status based on blood pressure category
      if (latest.category === 'normal') status = "normal";
      else if (latest.category === 'elevated') status = "warning";
      else if (latest.category === 'high') status = "warning";
      else if (latest.category === 'crisis') status = "critical";

      metrics.push({
        name: "Blood Pressure",
        current: currentBP,
        previous: previousBP,
        trend,
        status,
        icon: Activity,
        color: status === "normal" ? "green" : status === "warning" ? "orange" : "red"
      });
    }

    // Weight Metrics
    if (weightData.length > 0) {
      const latest = weightData[0];
      const previous = weightData[1];
      
      const currentWeight = `${latest.weight} ${latest.unit}`;
      const previousWeight = previous ? `${previous.weight} ${previous.unit}` : "N/A";
      
      let trend: "up" | "down" | "stable" = "stable";
      let status: "normal" | "improving" | "warning" | "critical" = "normal";
      
      if (previous) {
        trend = latest.weight < previous.weight ? "down" : latest.weight > previous.weight ? "up" : "stable";
        status = trend === "down" ? "improving" : trend === "up" ? "warning" : "normal";
      }

      metrics.push({
        name: "Weight",
        current: currentWeight,
        previous: previousWeight,
        trend,
        status,
        icon: Heart,
        color: status === "improving" ? "green" : status === "warning" ? "orange" : "blue"
      });
    }

    // Add placeholder metrics if no data
    if (metrics.length === 0) {
      metrics.push(
        {
          name: "Blood Pressure",
          current: "No data",
          previous: "N/A",
          trend: "stable",
          status: "normal",
          icon: Activity,
          color: "gray"
        },
        {
          name: "Weight",
          current: "No data",
          previous: "N/A",
          trend: "stable",
          status: "normal",
          icon: Heart,
          color: "gray"
        }
      );
    }

    setHealthMetrics(metrics);
  };

  const generateInsights = (bpData: BloodPressureData[], weightData: WeightData[], bloodWorkData: BloodWorkData[], doctorVisitsData: DoctorVisitData[]) => {
    const insights: Insight[] = [];

    // Blood Pressure Insights
    if (bpData.length > 0) {
      const latest = bpData[0];
      if (latest.category === 'high' || latest.category === 'crisis') {
        insights.push({
          title: "Blood Pressure Alert",
          description: `Your blood pressure is ${latest.category}. Consider consulting your doctor.`,
          type: "warning",
          icon: AlertTriangle,
          color: "red"
        });
      } else if (bpData.length > 1) {
        const previous = bpData[1];
        const currentAvg = (latest.systolic + latest.diastolic) / 2;
        const previousAvg = (previous.systolic + previous.diastolic) / 2;
        const improvement = previousAvg - currentAvg;
        
        if (improvement > 5) {
          insights.push({
            title: "Blood Pressure Improving",
            description: `Your blood pressure has improved by ${improvement.toFixed(1)} points.`,
            type: "positive",
            icon: TrendingDown,
            color: "green"
          });
        }
      }
    }

    // Weight Insights
    if (weightData.length > 1) {
      const latest = weightData[0];
      const previous = weightData[1];
      const weightChange = previous.weight - latest.weight;
      
      if (weightChange > 0) {
        insights.push({
          title: "Weight Loss Progress",
          description: `You've lost ${weightChange.toFixed(1)} ${latest.unit} since your last measurement.`,
          type: "positive",
          icon: TrendingDown,
          color: "green"
        });
      } else if (weightChange < 0) {
        insights.push({
          title: "Weight Gain Notice",
          description: `You've gained ${Math.abs(weightChange).toFixed(1)} ${latest.unit} since your last measurement.`,
          type: "warning",
          icon: TrendingUp,
          color: "orange"
        });
      }
    }

    // Doctor Visit Insights
    const upcomingVisits = doctorVisitsData.filter(visit => 
      new Date(visit.visitDate) > new Date() && visit.status === 'scheduled'
    );
    
    if (upcomingVisits.length > 0) {
      const nextVisit = upcomingVisits[0];
      const daysUntil = Math.ceil((new Date(nextVisit.visitDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      insights.push({
        title: "Upcoming Doctor Visit",
        description: `${nextVisit.visitType} with ${nextVisit.doctorName} in ${daysUntil} days.`,
        type: "reminder",
        icon: Calendar,
        color: "blue"
      });
    }

    // Blood Work Insights
    if (bloodWorkData.length > 0) {
      const latest = bloodWorkData[0];
      const abnormalResults = latest.results.filter(result => result.status !== 'normal');
      
      if (abnormalResults.length > 0) {
        insights.push({
          title: "Blood Work Results",
          description: `${abnormalResults.length} abnormal result(s) in your latest ${latest.testName}.`,
          type: "warning",
          icon: AlertTriangle,
          color: "orange"
        });
      } else {
        insights.push({
          title: "Blood Work Results",
          description: `All results from your ${latest.testName} are within normal range.`,
          type: "positive",
          icon: CheckCircle,
          color: "green"
        });
      }
    }

    // Add default insight if no data
    if (insights.length === 0) {
      insights.push({
        title: "Start Tracking",
        description: "Begin recording your health data to see personalized insights here.",
        type: "reminder",
        icon: Activity,
        color: "blue"
      });
    }

    setInsights(insights);
  };

  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(Math.max(0, currentMonth - 4), currentMonth + 1).map((month, index) => {
      const monthIndex = (currentMonth - 4 + index + 12) % 12;
      const monthData = {
        month,
        bloodPressure: bloodPressureData.length > 0 ? bloodPressureData[0].systolic : 120,
        weight: weightData.length > 0 ? weightData[0].weight : 165,
        heartRate: bloodPressureData.length > 0 ? bloodPressureData[0].pulse : 72,
        steps: 8000 + Math.floor(Math.random() * 2000) // Placeholder for steps
      };
      return monthData;
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Analytics</h1>
            <p className="text-gray-600">Loading your health data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Activity className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your health data</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {healthMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <metric.icon className={`h-4 w-4 ${
                metric.color === "green" ? "text-green-500" :
                metric.color === "blue" ? "text-blue-500" :
                metric.color === "orange" ? "text-orange-500" :
                metric.color === "red" ? "text-red-500" :
                "text-gray-500"
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.current}</div>
              <div className="flex items-center space-x-2">
                {metric.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : metric.trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <div className="h-4 w-4 text-gray-400">—</div>
                )}
                <p className="text-xs text-muted-foreground">
                  {metric.previous !== "N/A" ? `${metric.trend === "up" ? "+" : metric.trend === "down" ? "-" : ""} from ${metric.previous}` : "No previous data"}
                </p>
              </div>
              <Badge 
                variant={
                  metric.status === "normal" ? "success" :
                  metric.status === "improving" ? "info" :
                  metric.status === "warning" ? "warning" :
                  "danger"
                }
                className="text-xs mt-2"
              >
                {metric.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Trends Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Health Trends</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Your health metrics over time
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Blood Pressure Trend */}
                {bloodPressureData.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Blood Pressure (Systolic)</span>
                      <span className="text-sm text-gray-500">{bloodPressureData[0].systolic} mmHg</span>
                    </div>
                    <Progress 
                      value={Math.min((bloodPressureData[0].systolic / 140) * 100, 100)} 
                      variant={bloodPressureData[0].systolic > 130 ? "danger" : bloodPressureData[0].systolic > 120 ? "warning" : "success"}
                      className="h-2" 
                    />
                  </div>
                )}

                {/* Weight Trend */}
                {weightData.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Weight</span>
                      <span className="text-sm text-gray-500">{weightData[0].weight} {weightData[0].unit}</span>
                    </div>
                    <Progress value={78} variant="info" className="h-2" />
                  </div>
                )}

                {/* Heart Rate Trend */}
                {bloodPressureData.length > 0 && bloodPressureData[0].pulse && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Heart Rate</span>
                      <span className="text-sm text-gray-500">{bloodPressureData[0].pulse} bpm</span>
                    </div>
                    <Progress 
                      value={Math.min((bloodPressureData[0].pulse / 100) * 100, 100)} 
                      variant={bloodPressureData[0].pulse > 100 ? "danger" : bloodPressureData[0].pulse > 80 ? "warning" : "success"}
                      className="h-2" 
                    />
                  </div>
                )}
              </div>

              {/* Data Summary */}
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Data Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">{bloodPressureData.length}</div>
                    <div className="text-gray-600">Blood Pressure Readings</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">{weightData.length}</div>
                    <div className="text-gray-600">Weight Entries</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">{bloodWorkData.length}</div>
                    <div className="text-gray-600">Blood Work Tests</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">{doctorVisitsData.length}</div>
                    <div className="text-gray-600">Doctor Visits</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Insights</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                AI-powered health insights and recommendations
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    insight.color === "green" ? "bg-green-500" :
                    insight.color === "blue" ? "bg-blue-500" :
                    insight.color === "orange" ? "bg-orange-500" :
                    "bg-red-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {insight.description}
                    </p>
                  </div>
                  <Badge 
                    variant={insight.type === "positive" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {insight.type === "positive" ? "Positive" : insight.type === "warning" ? "Warning" : "Reminder"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Goals Progress</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Track your health goals and achievements
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {/* Weight Goal */}
                {weightData.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Weight Management</span>
                      <span className="text-sm text-gray-500">
                        {weightData.length > 1 ? 
                          `${Math.abs(weightData[0].weight - weightData[1].weight).toFixed(1)} ${weightData[0].unit} change` : 
                          "New tracking"
                        }
                      </span>
                    </div>
                    <Progress value={75} variant="info" className="h-2" />
                  </div>
                )}

                {/* Blood Pressure Goal */}
                {bloodPressureData.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Blood Pressure Goal</span>
                      <span className="text-sm text-gray-500">
                        {bloodPressureData[0].category === 'normal' ? '100%' : '75%'}
                      </span>
                    </div>
                    <Progress 
                      value={bloodPressureData[0].category === 'normal' ? 100 : 75} 
                      variant={bloodPressureData[0].category === 'normal' ? 'success' : 'warning'}
                      className="h-2" 
                    />
                  </div>
                )}

                {/* Doctor Visits Goal */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Regular Checkups</span>
                    <span className="text-sm text-gray-500">
                      {doctorVisitsData.filter(v => v.status === 'completed').length} completed
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((doctorVisitsData.filter(v => v.status === 'completed').length / 4) * 100, 100)} 
                    variant="success"
                    className="h-2" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span>Export Report</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Download your health analytics report
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/reports">
              <Button className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scale className="h-5 w-5 text-green-500" />
              <span>Set Goals</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Create new health goals and targets
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/goals">
              <Button variant="outline" className="w-full">
                <Scale className="h-4 w-4 mr-2" />
                Set Goals
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span>View Trends</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Analyze detailed health trends
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/blood-pressure/trends">
              <Button variant="outline" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Trends
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 