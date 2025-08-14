"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Plus, TrendingUp, AlertTriangle, Calendar, Clock, Edit, Trash2, RefreshCw, History } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import BackButton from "@/components/back-button";

interface MedicalHistoryEntry {
  _id: string;
  condition: string;
  diagnosisDate: Date;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'chronic';
  symptoms: string[];
  treatments: string[];
  medications: string[];
  doctorName?: string;
  specialty?: string;
  notes: string;
  followUpRequired: boolean;
  followUpDate?: Date;
}

export default function MedicalHistoryPage() {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedicalHistory = async () => {
    try {
      const response = await fetch('/api/medical-history');
      if (response.ok) {
        const data = await response.json();
        setMedicalHistory(data.data || []);
      } else {
        console.error('Failed to fetch medical history');
      }
    } catch (error) {
      console.error('Error fetching medical history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const activeConditions = medicalHistory.filter(entry => entry.status === 'active');
  const resolvedConditions = medicalHistory.filter(entry => entry.status === 'resolved');
  const chronicConditions = medicalHistory.filter(entry => entry.status === 'chronic');
  const requiresFollowUp = medicalHistory.filter(entry => entry.followUpRequired);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading medical history...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Medical History</h1>
            <p className="text-gray-600">Track your medical conditions and health history</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchMedicalHistory();
              toast.success('Medical history data refreshed');
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/dashboard/medical-history/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conditions</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalHistory.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConditions.length}</div>
            <p className="text-xs text-muted-foreground">
              Current conditions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedConditions.length}</div>
            <p className="text-xs text-muted-foreground">
              Past conditions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-up</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requiresFollowUp.length}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Conditions</CardTitle>
          <CardDescription>
            Your current medical conditions that require ongoing management
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeConditions.length > 0 ? (
            <div className="space-y-4">
              {activeConditions.map((entry) => (
                <div key={entry._id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{entry.condition}</h3>
                        <Badge variant={entry.severity === 'severe' ? 'destructive' : entry.severity === 'moderate' ? 'secondary' : 'default'}>
                          {entry.severity}
                        </Badge>
                        <Badge variant="outline">{entry.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Diagnosed: {new Date(entry.diagnosisDate).toLocaleDateString()}
                      </p>
                      {entry.doctorName && (
                        <p className="text-sm text-gray-600 mb-2">
                          Doctor: {entry.doctorName} {entry.specialty && `(${entry.specialty})`}
                        </p>
                      )}
                      {entry.symptoms.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Symptoms:</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.symptoms.map((symptom, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {entry.notes && (
                        <p className="text-sm text-gray-600">{entry.notes}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/medical-history/${entry._id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No active conditions</p>
              <p className="text-sm text-gray-400 mt-1">Add your first medical condition entry</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Medical History</CardTitle>
          <CardDescription>
            Your latest medical history entries and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {medicalHistory.length > 0 ? (
            <div className="space-y-4">
              {medicalHistory.slice(0, 5).map((entry) => (
                <div key={entry._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{entry.condition}</h3>
                      <Badge variant={entry.status === 'active' ? 'destructive' : entry.status === 'resolved' ? 'default' : 'secondary'}>
                        {entry.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(entry.diagnosisDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/dashboard/medical-history/${entry._id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No medical history entries yet</p>
              <Link href="/dashboard/medical-history/new">
                <Button className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Entry
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add New Entry</CardTitle>
            <CardDescription>
              Record a new medical condition or health event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/medical-history/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Medical History Entry
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Follow-up Reminders</CardTitle>
            <CardDescription>
              Track conditions that need ongoing monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/medical-history/follow-up">
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Manage Follow-ups
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 