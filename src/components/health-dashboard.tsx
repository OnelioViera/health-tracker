"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Scale, Target, TrendingUp, TrendingDown, Heart } from 'lucide-react';

interface HealthMetrics {
  weight?: {
    current: number;
    unit: string;
    trend: string;
    lastUpdated: string;
  };
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    category: string;
    lastUpdated: string;
  };
  goals?: Array<{
    title: string;
    progress: number;
    status: string;
  }>;
}

export default function HealthDashboard() {
  const [healthData, setHealthData] = useState<HealthMetrics>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      // Fetch from your health sync API
      const response = await fetch('/api/health-sync');
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? <TrendingUp className="h-4 w-4 text-red-500" /> : <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'normal':
        return 'text-green-600';
      case 'elevated':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      case 'crisis':
        return 'text-red-800';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {healthData.weight && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.weight.current} {healthData.weight.unit}</div>
            <div className="flex items-center space-x-1 mt-1">
              {getTrendIcon(healthData.weight.trend)}
              <span className="text-xs text-muted-foreground">
                {healthData.weight.trend === 'up' ? 'Gaining' : 'Losing'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Updated: {new Date(healthData.weight.lastUpdated).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      {healthData.bloodPressure && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic}
            </div>
            <div className={`text-sm font-medium ${getCategoryColor(healthData.bloodPressure.category)}`}>
              {healthData.bloodPressure.category.charAt(0).toUpperCase() + healthData.bloodPressure.category.slice(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Updated: {new Date(healthData.bloodPressure.lastUpdated).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      {healthData.goals && healthData.goals.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.goals.length}</div>
            <p className="text-xs text-muted-foreground">
              {healthData.goals.filter(g => g.status === 'active').length} active
            </p>
            <div className="mt-2 space-y-1">
              {healthData.goals.slice(0, 2).map((goal, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="truncate">{goal.title}</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 