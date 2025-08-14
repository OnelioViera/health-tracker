"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, History, Plus } from "lucide-react";
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

export default function FollowUpPage() {
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

  const requiresFollowUp = medicalHistory.filter(entry => entry.followUpRequired);
  const overdueFollowUps = requiresFollowUp.filter(entry => {
    if (!entry.followUpDate) return false;
    return new Date(entry.followUpDate) < new Date();
  });
  const upcomingFollowUps = requiresFollowUp.filter(entry => {
    if (!entry.followUpDate) return false;
    return new Date(entry.followUpDate) >= new Date();
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading follow-up data...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Follow-up Management</h1>
            <p className="text-gray-600">Track conditions that need ongoing monitoring</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/medical-history/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Follow-ups</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requiresFollowUp.length}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueFollowUps.length}</div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingFollowUps.length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Follow-ups */}
      {overdueFollowUps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Overdue Follow-ups</span>
            </CardTitle>
            <CardDescription>
              These conditions need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overdueFollowUps.map((entry) => (
                <div key={entry._id} className="border border-red-200 rounded-lg p-4 space-y-3 bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{entry.condition}</h3>
                        <Badge variant="destructive">Overdue</Badge>
                        <Badge variant={entry.severity === 'severe' ? 'destructive' : entry.severity === 'moderate' ? 'secondary' : 'default'}>
                          {entry.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Follow-up was due: {entry.followUpDate ? new Date(entry.followUpDate).toLocaleDateString() : 'No date set'}
                      </p>
                      {entry.doctorName && (
                        <p className="text-sm text-gray-600 mb-2">
                          Doctor: {entry.doctorName} {entry.specialty && `(${entry.specialty})`}
                        </p>
                      )}
                      {entry.notes && (
                        <p className="text-sm text-gray-600">{entry.notes}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/medical-history/${entry._id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Follow-ups */}
      {upcomingFollowUps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <span>Upcoming Follow-ups</span>
            </CardTitle>
            <CardDescription>
              Scheduled follow-up appointments and check-ins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingFollowUps
                .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())
                .map((entry) => (
                <div key={entry._id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{entry.condition}</h3>
                        <Badge variant="default">Upcoming</Badge>
                        <Badge variant={entry.severity === 'severe' ? 'destructive' : entry.severity === 'moderate' ? 'secondary' : 'default'}>
                          {entry.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Follow-up due: {entry.followUpDate ? new Date(entry.followUpDate).toLocaleDateString() : 'No date set'}
                      </p>
                      {entry.doctorName && (
                        <p className="text-sm text-gray-600 mb-2">
                          Doctor: {entry.doctorName} {entry.specialty && `(${entry.specialty})`}
                        </p>
                      )}
                      {entry.notes && (
                        <p className="text-sm text-gray-600">{entry.notes}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/medical-history/${entry._id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Follow-ups */}
      {requiresFollowUp.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5 text-gray-500" />
              <span>No Follow-ups Required</span>
            </CardTitle>
            <CardDescription>
              All your medical conditions are up to date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No follow-ups required</p>
              <p className="text-sm text-gray-400 mt-1">Great job staying on top of your health!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add New Entry</CardTitle>
            <CardDescription>
              Record a new medical condition that requires follow-up
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
            <CardTitle className="text-lg">View All Entries</CardTitle>
            <CardDescription>
              See your complete medical history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/medical-history">
              <Button variant="outline" className="w-full">
                <History className="h-4 w-4 mr-2" />
                View Medical History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 