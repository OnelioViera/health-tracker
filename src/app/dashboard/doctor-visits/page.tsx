"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Plus, TrendingUp, AlertTriangle, Calendar, Clock, DollarSign, Edit, Trash2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import BackButton from "@/components/back-button";
import AppointmentCard from "@/components/appointment-card";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface DoctorVisitData {
  _id: string;
  doctorName: string;
  specialty: string;
  visitDate: Date;
  visitTime?: string;
  visitType: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  medications: Medication[];
  recommendations: string[];
  followUpDate?: Date;
  notes: string;
  cost?: number;
  insurance?: string;
  location?: string;
  status: string;
}

export default function DoctorVisitsPage() {
  const [doctorVisits, setDoctorVisits] = useState<DoctorVisitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDoctorVisits = async () => {
    try {
      const response = await fetch('/api/doctor-visits');
      if (response.ok) {
        const data = await response.json();
        setDoctorVisits(data.data || []);
      } else {
        console.error('Failed to fetch doctor visits');
      }
    } catch (error) {
      console.error('Error fetching doctor visits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorVisits();
  }, []);

  const upcomingVisits = doctorVisits.filter(visit => {
    const visitDate = new Date(visit.visitDate);
    const now = new Date();
    // Only show as upcoming if it's scheduled AND the date hasn't passed
    return visit.status === 'scheduled' && visitDate >= now;
  });
  
  const completedVisits = doctorVisits.filter(visit => {
    const visitDate = new Date(visit.visitDate);
    const now = new Date();
    // Show as completed if status is completed OR if the date has passed
    return visit.status === 'completed' || visitDate < now;
  });
  const totalCost = doctorVisits.reduce((sum, visit) => sum + (visit.cost || 0), 0);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading doctor visits...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Doctor Visits</h1>
            <p className="text-gray-600">Track your medical appointments and visits</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchDoctorVisits();
              toast.success('Doctor visits data refreshed');
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/dashboard/doctor-visits/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Visit
            </Button>
          </Link>
        </div>
      </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctorVisits.length}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingVisits.length}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled visits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Clock className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedVisits.length}</div>
              <p className="text-xs text-muted-foreground">
                Completed visits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              Your scheduled doctor visits and consultations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingVisits.length > 0 ? (
              <div className="space-y-4">
                {upcomingVisits.map((visit) => (
                  <AppointmentCard 
                    key={visit._id} 
                    visit={visit} 
                    isUpcoming={true} 
                    onStatusUpdate={fetchDoctorVisits}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No upcoming appointments</p>
                <Link href="/dashboard/doctor-visits/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Your First Visit
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Visits */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Visits</CardTitle>
            <CardDescription>
              Your completed doctor visits and consultations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {completedVisits.length > 0 ? (
              <div className="space-y-4">
                {completedVisits.slice(0, 5).map((visit) => (
                  <AppointmentCard 
                    key={visit._id} 
                    visit={visit} 
                    isUpcoming={false} 
                    onStatusUpdate={fetchDoctorVisits}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No completed visits yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-blue-500" />
                <span>Add Visit</span>
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
                <Calendar className="h-5 w-5 text-green-500" />
                <span>Calendar View</span>
              </CardTitle>
              <CardDescription>
                View all appointments in calendar format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/doctor-visits/calendar">
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } 