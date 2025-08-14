'use client';

import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { 
  Activity, 
  CreditCard, 
  Stethoscope, 
  Scale, 
  Plus, 
  TrendingUp,
  Calendar,
  FileText,
  Heart,
  Target,
  RefreshCw
} from 'lucide-react';

interface HealthDataSummary {
  bloodPressure: {
    latest?: {
      systolic: number;
      diastolic: number;
      pulse: number;
      date: string;
      category: string;
    };
    total: number;
    trend: 'up' | 'down' | 'stable';
  };
  medicalHistory: {
    latest?: {
      condition: string;
      status: string;
      date: string;
    };
    total: number;
    trend: 'up' | 'down' | 'stable';
  };
  weight: {
    latest?: {
      weight: number;
      bmi: number;
      date: string;
    };
    total: number;
    trend: 'up' | 'down' | 'stable';
  };
  doctorVisits: {
    upcoming: number;
    recent: number;
    total: number;
  };
}

interface DoctorVisit {
  _id: string;
  doctorName: string;
  specialty: string;
  visitDate: string;
  visitType: string;
  status: string;
  diagnosis?: string;
  cost?: number;
}

export default function HealthDataPage() {
  const [summary, setSummary] = useState<HealthDataSummary>({
    bloodPressure: { total: 0, trend: 'stable' },
    medicalHistory: { total: 0, trend: 'stable' },
    weight: { total: 0, trend: 'stable' },
    doctorVisits: { upcoming: 0, recent: 0, total: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHealthDataSummary();
  }, []);

  const fetchHealthDataSummary = async () => {
    try {
      setIsLoading(true);
      
      // Fetch blood pressure summary
      const bpResponse = await fetch('/api/blood-pressure?limit=1');
      const bpData = bpResponse.ok ? await bpResponse.json() : { data: [] };
      
      // Fetch weight summary
      const weightResponse = await fetch('/api/weight?limit=1');
      const weightData = weightResponse.ok ? await weightResponse.json() : { data: [] };
      
      // Fetch medical history summary
      const mhResponse = await fetch('/api/medical-history?limit=1');
      const mhData = mhResponse.ok ? await mhResponse.json() : { data: [] };
      
      // Fetch doctor visits summary
      const dvResponse = await fetch('/api/doctor-visits');
      const dvData = dvResponse.ok ? await dvResponse.json() : { data: [] };
      
      const now = new Date();
      const upcomingVisits = dvData.data?.filter((visit: DoctorVisit) => {
        const visitDate = new Date(visit.visitDate);
        return visit.status === 'scheduled' && visitDate >= now;
      }) || [];
      
      const recentVisits = dvData.data?.filter((visit: DoctorVisit) => {
        const visitDate = new Date(visit.visitDate);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return visitDate >= thirtyDaysAgo;
      }) || [];

      setSummary({
        bloodPressure: {
          latest: bpData.data?.[0] ? {
            systolic: bpData.data[0].systolic || 0,
            diastolic: bpData.data[0].diastolic || 0,
            pulse: bpData.data[0].pulse || 0,
            date: bpData.data[0].date,
            category: bpData.data[0].category || 'normal'
          } : undefined,
          total: bpData.data?.length || 0,
          trend: 'stable'
        },
        medicalHistory: {
          latest: mhData.data?.[0] ? {
            condition: mhData.data[0].condition,
            status: mhData.data[0].status,
            date: mhData.data[0].diagnosisDate
          } : undefined,
          total: mhData.data?.length || 0,
          trend: 'stable'
        },
        weight: {
          latest: weightData.data?.[0] ? {
            weight: weightData.data[0].weight || 0,
            bmi: weightData.data[0].bmi || 0,
            date: weightData.data[0].date
          } : undefined,
          total: weightData.data?.length || 0,
          trend: 'stable'
        },
        doctorVisits: {
          upcoming: upcomingVisits.length,
          recent: recentVisits.length,
          total: dvData.data?.length || 0
        }
      });
    } catch (error) {
      console.error('Error fetching health data summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-500';
      case 'down': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'normal': return 'success';
      case 'elevated': return 'warning';
      case 'high': return 'danger';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Data Overview</h1>
          <p className="text-gray-600">Monitor and manage all your health metrics in one place</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchHealthDataSummary();
            toast.success('Health data refreshed');
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.bloodPressure.latest ? 
                `${summary.bloodPressure.latest.systolic}/${summary.bloodPressure.latest.diastolic}` : 
                'No data'
              }
            </div>
            <p className="text-xs text-gray-500">
              {summary.bloodPressure.latest ? 
                `${summary.bloodPressure.total} readings recorded` : 
                'Start tracking'
              }
            </p>
            {summary.bloodPressure.latest && (
              <Badge variant={getCategoryColor(summary.bloodPressure.latest.category) as "success" | "warning" | "danger" | "secondary"}>
                {summary.bloodPressure.latest.category}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight & BMI</CardTitle>
            <Scale className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.weight.latest && summary.weight.latest.weight > 0 ? 
                `${summary.weight.latest.weight} lbs` : 
                'No data'
              }
            </div>
            <p className="text-xs text-gray-500">
              {summary.weight.latest && summary.weight.latest.bmi ? 
                `BMI: ${summary.weight.latest.bmi.toFixed(1)}` : 
                'Start tracking'
              }
            </p>
            {summary.weight.latest && summary.weight.latest.bmi && (
              <div className="mt-2">
                <Progress 
                  value={Math.min(summary.weight.latest.bmi * 2, 100)} 
                  variant={summary.weight.latest.bmi < 18.5 ? 'info' : summary.weight.latest.bmi < 25 ? 'success' : summary.weight.latest.bmi < 30 ? 'warning' : 'danger'}
                  className="h-2" 
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical History</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.medicalHistory.latest ? 
                `${summary.medicalHistory.latest.condition} (${summary.medicalHistory.latest.status})` : 
                'No data'
              }
            </div>
            <p className="text-xs text-gray-500">
              {summary.medicalHistory.latest ? 
                `${summary.medicalHistory.total} records` : 
                'Start tracking'
              }
            </p>
            {summary.medicalHistory.latest && (
              <Badge variant="info" className="mt-2">
                Latest: {new Date(summary.medicalHistory.latest.date).toLocaleDateString()}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doctor Visits</CardTitle>
            <Stethoscope className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.doctorVisits.total}</div>
            <p className="text-xs text-gray-500">
              {summary.doctorVisits.upcoming} upcoming, {summary.doctorVisits.recent} recent
            </p>
            {summary.doctorVisits.upcoming > 0 && (
              <Badge variant="warning" className="mt-2">
                {summary.doctorVisits.upcoming} upcoming
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Medical History</span>
            </CardTitle>
            <CardDescription>
              Log your latest medical conditions or diagnoses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/medical-history/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add History
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
      </div>

      {/* Detailed Views */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span>View All Data</span>
            </CardTitle>
            <CardDescription>
              Access detailed views of all your health data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/blood-pressure">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Blood Pressure History
              </Button>
            </Link>
            <Link href="/dashboard/weight">
              <Button variant="outline" className="w-full justify-start">
                <Scale className="h-4 w-4 mr-2" />
                Weight & BMI History
              </Button>
            </Link>
            <Link href="/dashboard/medical-history">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Medical History Records
              </Button>
            </Link>
            <Link href="/dashboard/doctor-visits">
              <Button variant="outline" className="w-full justify-start">
                <Stethoscope className="h-4 w-4 mr-2" />
                Doctor Visit History
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-indigo-500" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
            <Link href="/dashboard/calendar">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Manage Calendar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 