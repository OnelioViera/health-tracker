"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  TrendingUp, 
  Stethoscope, 
  Heart, 
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  Scale,
  FileText,
  RefreshCw,
  ChevronDown,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  Users,
  Target,
  Mountain
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import SyncToHikingJournal from "@/components/sync-to-hiking-journal";

interface BloodPressureReading {
  _id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  date: string;
  notes?: string;
  category: 'normal' | 'elevated' | 'high' | 'crisis';
}

interface WeightRecord {
  _id: string;
  weight: number;
  height?: number;
  unit: string;
  heightUnit?: string;
  date: string;
  notes?: string;
}

interface BloodWorkResult {
  parameter: string;
  value: number;
  unit: string;
  referenceRange: { min: number; max: number };
  status: string;
}

interface BloodWorkRecord {
  _id: string;
  testName: string;
  testDate: string;
  results: BloodWorkResult[];
  labName: string;
  doctorName?: string;
  notes?: string;
  category: string;
}

interface DoctorVisit {
  _id: string;
  doctorName: string;
  specialty: string;
  visitDate: string;
  visitTime?: string;
  visitType: string;
  status: string;
  notes?: string;
  location?: string;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

interface DashboardData {
  bloodPressure: BloodPressureReading | null;
  bloodPressureHistory: BloodPressureReading[];
  weight: WeightRecord | null;
  weightHistory: WeightRecord[];
  bloodWork: BloodWorkRecord | null;
  doctorVisit: DoctorVisit | null;
  upcomingVisits: DoctorVisit[];
  recentActivity: RecentActivity[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    bloodPressure: null,
    bloodPressureHistory: [],
    weight: null,
    weightHistory: [],
    bloodWork: null,
    doctorVisit: null,
    upcomingVisits: [],
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  const scrollToQuickActions = () => {
    const quickActionsSection = document.querySelector('[data-section="quick-actions"]');
    if (quickActionsSection) {
      quickActionsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchLatestData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch latest blood pressure reading and history
      const bpResponse = await fetch('/api/blood-pressure?limit=5');
      const bpData = bpResponse.ok ? await bpResponse.json() : { data: [] };
      
      // Fetch latest weight record and history
      const weightResponse = await fetch('/api/weight?limit=5');
      const weightData = weightResponse.ok ? await weightResponse.json() : { data: [] };
      
      // Fetch latest blood work
      const bwResponse = await fetch('/api/blood-work?limit=1');
      const bwData = bwResponse.ok ? await bwResponse.json() : { data: [] };
      
      // Fetch all doctor visits
      const dvResponse = await fetch('/api/doctor-visits');
      const dvData = dvResponse.ok ? await dvResponse.json() : { data: [] };
      
      // Filter upcoming visits (scheduled status and future dates)
      const now = new Date();
      const upcomingVisits = dvData.data?.filter((visit: DoctorVisit) => {
        const visitDate = new Date(visit.visitDate);
        return visit.status === 'scheduled' && visitDate >= now;
      }).sort((a: DoctorVisit, b: DoctorVisit) => 
        new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()
      ) || [];

      setDashboardData({
        bloodPressure: bpData.data?.[0] || null,
        bloodPressureHistory: bpData.data || [],
        weight: weightData.data?.[0] || null,
        weightHistory: weightData.data || [],
        bloodWork: bwData.data?.[0] || null,
        doctorVisit: upcomingVisits[0] || null,
        upcomingVisits: upcomingVisits,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestData();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'normal':
        return 'success';
      case 'elevated':
        return 'warning';
      case 'high':
        return 'danger';
      case 'crisis':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'normal':
        return 'Normal';
      case 'elevated':
        return 'Elevated';
      case 'high':
        return 'High';
      case 'crisis':
        return 'Crisis';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // For weight records, show only the actual date and time
    if (diffDays === 0) {
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays === 1) {
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays === -1) {
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    if (diffDays > 0) {
      // Future date
      if (diffDays < 7) {
        return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return date.toLocaleDateString();
    } else {
      // Past date
      const absDiffDays = Math.abs(diffDays);
      if (absDiffDays < 7) {
        return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return date.toLocaleDateString();
    }
  };

  const formatVisitDate = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = timeString || '9:00 AM';
    return `${formattedDate} at ${formattedTime}`;
  };

  const calculateTrend = (current: number, previous: number) => {
    if (!previous) return null;
    const diff = current - previous;
    const percentage = ((diff / previous) * 100).toFixed(1);
    return { diff, percentage, isPositive: diff > 0 };
  };

  const getWeightTrend = () => {
    if (dashboardData.weightHistory.length < 2) return null;
    const current = dashboardData.weightHistory[0].weight;
    const previous = dashboardData.weightHistory[1].weight;
    return calculateTrend(current, previous);
  };

  const getBloodPressureTrend = () => {
    if (dashboardData.bloodPressureHistory.length < 2) return null;
    const current = dashboardData.bloodPressureHistory[0];
    const previous = dashboardData.bloodPressureHistory[1];
    
    const systolicTrend = calculateTrend(current.systolic, previous.systolic);
    const diastolicTrend = calculateTrend(current.diastolic, previous.diastolic);
    
    return { systolic: systolicTrend, diastolic: diastolicTrend };
  };

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

  const getCurrentBMI = () => {
    if (!dashboardData.weight || !dashboardData.weight.height) return null;
    return calculateBMI(
      dashboardData.weight.weight, 
      dashboardData.weight.height, 
      dashboardData.weight.unit, 
      dashboardData.weight.heightUnit || 'in'
    );
  };

  const getBMITrend = () => {
    if (dashboardData.weightHistory.length < 2) return null;
    const current = dashboardData.weightHistory[0];
    const previous = dashboardData.weightHistory[1];
    
    if (!current.height || !previous.height) return null;
    
    const currentBMI = calculateBMI(current.weight, current.height, current.unit, current.heightUnit || 'in');
    const previousBMI = calculateBMI(previous.weight, previous.height, previous.unit, previous.heightUnit || 'in');
    
    return calculateTrend(currentBMI, previousBMI);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName || 'there'}! Here&apos;s your health overview.</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading your health data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName || 'there'}! Here&apos;s your health overview.</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchLatestData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={scrollToQuickActions}>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Enhanced Blood Pressure Card */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Blood Pressure Overview</CardTitle>
          <Activity className="h-5 w-5 text-red-500" />
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboardData.bloodPressure ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Reading */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Current Reading</div>
                <div className="text-3xl font-bold text-gray-900">
                  {dashboardData.bloodPressure.systolic}/{dashboardData.bloodPressure.diastolic}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getCategoryColor(dashboardData.bloodPressure.category) as "success" | "warning" | "danger" | "secondary"}>
                    {getCategoryBadge(dashboardData.bloodPressure.category)}
                  </Badge>
                  {dashboardData.bloodPressure.pulse && (
                    <span className="text-sm text-gray-500">Pulse: {dashboardData.bloodPressure.pulse} bpm</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(dashboardData.bloodPressure.date).toLocaleDateString()} at {new Date(dashboardData.bloodPressure.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>

              {/* Trend Analysis */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Trend Analysis</div>
                {getBloodPressureTrend() ? (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">Systolic:</span>
                      {getBloodPressureTrend()?.systolic?.isPositive ? (
                        <ArrowUp className="h-3 w-3 text-red-500" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-green-500" />
                      )}
                      <span className={`text-sm ${getBloodPressureTrend()?.systolic?.isPositive ? 'text-red-500' : 'text-green-500'}`}>
                        {Math.abs(getBloodPressureTrend()?.systolic?.diff || 0)} mmHg
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">Diastolic:</span>
                      {getBloodPressureTrend()?.diastolic?.isPositive ? (
                        <ArrowUp className="h-3 w-3 text-red-500" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-green-500" />
                      )}
                      <span className={`text-sm ${getBloodPressureTrend()?.diastolic?.isPositive ? 'text-red-500' : 'text-green-500'}`}>
                        {Math.abs(getBloodPressureTrend()?.diastolic?.diff || 0)} mmHg
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No trend data available</div>
                )}
              </div>

              {/* Recent History */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Recent Readings</div>
                <div className="space-y-1">
                  {dashboardData.bloodPressureHistory.slice(1, 4).map((reading, index) => (
                    <div key={reading._id} className="flex items-center justify-between text-xs">
                      <span>{reading.systolic}/{reading.diastolic}</span>
                      <Badge variant={getCategoryColor(reading.category) as "success" | "warning" | "danger" | "secondary"} className="text-xs">
                        {getCategoryBadge(reading.category)}
                      </Badge>
                      <span className="text-gray-500">{formatDate(reading.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No blood pressure readings</p>
              <p className="text-sm text-gray-400">Add your first reading to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Weight Card */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Weight & Body Composition</CardTitle>
          <Scale className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboardData.weight ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Weight */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Current Weight</div>
                <div className="text-3xl font-bold text-gray-900">
                  {dashboardData.weight.weight} {dashboardData.weight.unit}
                </div>
                {getWeightTrend() && (
                  <div className="flex items-center space-x-1">
                    {getWeightTrend()?.isPositive ? (
                      <ArrowUp className="h-3 w-3 text-red-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-green-500" />
                    )}
                    <span className={`text-sm ${getWeightTrend()?.isPositive ? 'text-red-500' : 'text-green-500'}`}>
                      {Math.abs(getWeightTrend()?.diff || 0).toFixed(2)} {dashboardData.weight.unit} ({getWeightTrend()?.percentage}%)
                    </span>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {formatDate(dashboardData.weight.date)}
                </div>
              </div>

              {/* BMI Information */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Body Mass Index (BMI)</div>
                {getCurrentBMI() ? (
                  <>
                    <div className="text-3xl font-bold text-gray-900">
                      {getCurrentBMI()?.toFixed(2)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getBMICategory(getCurrentBMI()!).color as "info" | "success" | "warning" | "danger"}>
                        {getBMICategory(getCurrentBMI()!).category}
                      </Badge>
                      {getBMITrend() && (
                        <div className="flex items-center space-x-1">
                          {getBMITrend()?.isPositive ? (
                            <ArrowUp className="h-3 w-3 text-red-500" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-green-500" />
                          )}
                          <span className={`text-sm ${getBMITrend()?.isPositive ? 'text-red-500' : 'text-green-500'}`}>
                            {Math.abs(getBMITrend()?.diff || 0).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* BMI Reference Ranges */}
                    {/* Removed BMI range display as per edit hint */}
                    
                    <div className="text-xs text-gray-500">
                      Height: {dashboardData.weight.height} {dashboardData.weight.heightUnit || 'in'}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">Height data needed for BMI</div>
                )}
              </div>

              {/* Weight History */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Recent History</div>
                <div className="space-y-1">
                  {dashboardData.weightHistory.slice(1, 4).map((record, index) => {
                    const bmi = record.height 
                      ? calculateBMI(record.weight, record.height, record.unit, record.heightUnit || 'in')
                      : 0;
                    return (
                      <div key={record._id} className="flex items-center justify-between text-xs">
                        <span>{record.weight} {record.unit}</span>
                        {bmi > 0 && (
                          <Badge variant="outline" className="text-xs">
                            BMI: {bmi.toFixed(2)}
                          </Badge>
                        )}
                        <span className="text-gray-500">{formatDate(record.date)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Scale className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No weight records</p>
              <p className="text-sm text-gray-400">Add your first weight record to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Tests</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {dashboardData.bloodWork ? (
              <>
                <div className="text-2xl font-bold">{dashboardData.bloodWork.testName.split(' ')[0]}</div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(dashboardData.bloodWork.testDate)}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-400">No tests</div>
                <p className="text-xs text-muted-foreground">
                  Add your first test result
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Visits</CardTitle>
            <Stethoscope className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {dashboardData.upcomingVisits.length > 0 ? (
              <>
                <div className="text-2xl font-bold">{dashboardData.upcomingVisits.length}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.upcomingVisits.length === 1 ? 'appointment' : 'appointments'} scheduled
                </p>
                <div className="mt-3">
                  {/* Show the soonest appointment */}
                  {dashboardData.upcomingVisits[0] && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {dashboardData.upcomingVisits[0].visitType} - {dashboardData.upcomingVisits[0].specialty}
                        </span>
                      </div>
                      <div className="text-xs text-blue-700">
                        <div className="font-medium">{dashboardData.upcomingVisits[0].doctorName}</div>
                      </div>
                    </div>
                  )}
                  {/* View All button */}
                  {dashboardData.upcomingVisits.length > 1 && (
                    <Link href="/dashboard/doctor-visits">
                      <Button variant="outline" size="sm" className="w-full">
                        <Calendar className="h-3 w-3 mr-1" />
                        View All ({dashboardData.upcomingVisits.length})
                      </Button>
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-400">No visits</div>
                <p className="text-xs text-muted-foreground">
                  Schedule your next visit
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">85</div>
            <p className="text-xs text-muted-foreground">
              Based on recent readings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days</div>
            <p className="text-xs text-muted-foreground">
              Consistent tracking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-section="quick-actions">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-red-500" />
              <span>Blood Pressure</span>
            </CardTitle>
            <CardDescription>
              Record your latest blood pressure reading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/blood-pressure/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Reading
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scale className="h-5 w-5 text-orange-500" />
              <span>Weight</span>
            </CardTitle>
            <CardDescription>
              Log your current weight and body composition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/weight/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Weight
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mountain className="h-5 w-5 text-green-500" />
              <span>Exercise</span>
            </CardTitle>
            <CardDescription>
              Track your hiking and fitness activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/exercise">
              <Button variant="outline" className="w-full">
                <Mountain className="h-4 w-4 mr-2" />
                View Activities
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Blood Work</span>
            </CardTitle>
            <CardDescription>
              Log your latest lab results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/blood-work/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Results
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-green-500" />
              <span>Doctor Visit</span>
            </CardTitle>
            <CardDescription>
              Schedule or log a doctor appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/doctor-visits/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Visit
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span>Analytics</span>
            </CardTitle>
            <CardDescription>
              View detailed health trends and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <span>Goals</span>
            </CardTitle>
            <CardDescription>
              Set and track your health objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/goals">
              <Button variant="outline" className="w-full">
                <Target className="h-4 w-4 mr-2" />
                Manage Goals
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Reports</span>
            </CardTitle>
            <CardDescription>
              Generate and export health reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/reports">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Generate Reports
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              <span>Calendar</span>
            </CardTitle>
            <CardDescription>
              Manage appointments and health events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/calendar">
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <SyncToHikingJournal />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest health records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.bloodPressure && (
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <Activity className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Blood Pressure Reading</p>
                  <p className="text-xs text-gray-500">
                    {dashboardData.bloodPressure.systolic}/{dashboardData.bloodPressure.diastolic} mmHg • {formatDate(dashboardData.bloodPressure.date)}
                  </p>
                </div>
                <Badge variant="secondary" className={getCategoryColor(dashboardData.bloodPressure.category)}>
                  {getCategoryBadge(dashboardData.bloodPressure.category)}
                </Badge>
              </div>
            )}

            {dashboardData.bloodWork && (
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Blood Work Results</p>
                  <p className="text-xs text-gray-500">
                    {dashboardData.bloodWork.testName} • {formatDate(dashboardData.bloodWork.testDate)}
                  </p>
                </div>
                <Badge variant="secondary">Recent</Badge>
              </div>
            )}

            {dashboardData.weight && (
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <Heart className="h-5 w-5 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Weight Recorded</p>
                  <p className="text-xs text-gray-500">
                    {dashboardData.weight.weight} {dashboardData.weight.unit} • {formatDate(dashboardData.weight.date)}
                  </p>
                </div>
                <Badge variant="secondary">Current</Badge>
              </div>
            )}

            {!dashboardData.bloodPressure && !dashboardData.bloodWork && !dashboardData.weight && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400">Start by adding your first health record</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Schedule Appointment</p>
                <p className="text-xs text-gray-500">Book your next doctor visit</p>
              </div>
              <Link href="/dashboard/doctor-visits/new">
                <Button size="sm" variant="outline">
                  Schedule
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Health Check</p>
                <p className="text-xs text-gray-500">Record today&apos;s vital signs</p>
              </div>
              <Link href="/dashboard/blood-pressure/new">
                <Button size="sm" variant="outline">
                  Record
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Set Reminders</p>
                <p className="text-xs text-gray-500">Configure health reminders</p>
              </div>
              <Link href="/dashboard/blood-pressure/reminders">
                <Button size="sm" variant="outline">
                  Configure
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 