"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Plus, TrendingUp, AlertTriangle, TestTube, Calendar, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/back-button";
import { useState, useEffect } from "react";

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

export default function BloodWorkPage() {
  const [bloodWorkRecords, setBloodWorkRecords] = useState<BloodWorkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBloodWork = async () => {
    try {
      const response = await fetch('/api/blood-work');
      if (response.ok) {
        const data = await response.json();
        setBloodWorkRecords(data.data || []);
      } else {
        console.error('Failed to fetch blood work records');
      }
    } catch (error) {
      console.error('Error fetching blood work records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodWork();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    
    if (diffDays > 0) {
      // Future date
      if (diffDays < 7) return `in ${diffDays} days`;
      return date.toLocaleDateString();
    } else {
      // Past date
      const absDiffDays = Math.abs(diffDays);
      if (absDiffDays < 7) return `${absDiffDays} days ago`;
      return date.toLocaleDateString();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'normal':
        return 'success';
      case 'abnormal':
        return 'danger';
      case 'borderline':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'normal':
        return 'Normal';
      case 'abnormal':
        return 'Abnormal';
      case 'borderline':
        return 'Borderline';
      default:
        return 'Unknown';
    }
  };

  // Calculate stats
  const totalTests = bloodWorkRecords.length;
  const normalResults = bloodWorkRecords.filter(record => record.category === 'normal').length;
  const abnormalResults = bloodWorkRecords.filter(record => record.category === 'abnormal').length;
  const latestTest = bloodWorkRecords[0];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blood Work</h1>
              <p className="text-gray-600">Track your lab results and blood tests</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading blood work records...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Blood Work</h1>
            <p className="text-gray-600">Track your lab results and blood tests</p>
          </div>
        </div>
        <Link href="/dashboard/blood-work/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Result
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground">
              {totalTests > 0 ? 'All time' : 'No tests yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normal Results</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{normalResults}</div>
            <p className="text-xs text-muted-foreground">
              {totalTests > 0 ? `${Math.round((normalResults / totalTests) * 100)}% of tests` : 'No tests'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abnormal Results</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{abnormalResults}</div>
            <p className="text-xs text-muted-foreground">
              {totalTests > 0 ? `${Math.round((abnormalResults / totalTests) * 100)}% of tests` : 'No tests'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Test</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {latestTest ? (
              <>
                <div className="text-2xl font-bold">{latestTest.testName.split(' ')[0]}</div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(latestTest.testDate)}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-400">No tests</div>
                <p className="text-xs text-muted-foreground">
                  Add your first test
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Blood Work</CardTitle>
          <CardDescription>
            Your latest lab results and test reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bloodWorkRecords.length > 0 ? (
            <div className="space-y-4">
              {bloodWorkRecords.map((record) => (
                <div key={record._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{record.testName}</p>
                      <p className="text-sm text-gray-500">
                        {record.labName} • {formatDate(record.testDate)}
                      </p>
                      {record.doctorName && (
                        <p className="text-xs text-gray-500">Dr. {record.doctorName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getCategoryColor(record.category)}>
                      {getCategoryBadge(record.category)}
                    </Badge>
                    <Link href={`/dashboard/blood-work/${record._id}`}>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No blood work records yet</p>
              <Link href="/dashboard/blood-work/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Test
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-blue-500" />
              <span>Add Test Result</span>
            </CardTitle>
            <CardDescription>
              Record a new blood work result
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/blood-work/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Result
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>View Trends</span>
            </CardTitle>
            <CardDescription>
              Analyze your test result patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/blood-work/trends">
              <Button variant="outline" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Trends
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span>Schedule Tests</span>
            </CardTitle>
            <CardDescription>
              Plan your next blood work appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/calendar">
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 