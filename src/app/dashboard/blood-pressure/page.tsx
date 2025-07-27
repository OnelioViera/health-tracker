"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Plus, TrendingUp, AlertTriangle, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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

export default function BloodPressurePage() {
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReading, setSelectedReading] = useState<BloodPressureReading | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReading, setEditingReading] = useState<BloodPressureReading | null>(null);

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

  // Create new reading
  const createReading = async (readingData: any) => {
    try {
      const response = await fetch('/api/blood-pressure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(readingData),
      });

      if (response.ok) {
        const newReading = await response.json();
        setReadings(prev => [newReading, ...prev]);
        toast.success('Reading added successfully');
        return newReading;
      } else {
        throw new Error('Failed to create reading');
      }
    } catch (error) {
      console.error('Error creating reading:', error);
      toast.error('Failed to create reading');
      throw error;
    }
  };

  // Update reading
  const updateReading = async (readingId: string, readingData: any) => {
    try {
      const response = await fetch(`/api/blood-pressure/${readingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(readingData),
      });

      if (response.ok) {
        const updatedReading = await response.json();
        setReadings(prev => prev.map(reading => 
          reading._id === readingId ? updatedReading : reading
        ));
        toast.success('Reading updated successfully');
        return updatedReading;
      } else {
        throw new Error('Failed to update reading');
      }
    } catch (error) {
      console.error('Error updating reading:', error);
      toast.error('Failed to update reading');
      throw error;
    }
  };

  // Delete reading
  const deleteReading = async (readingId: string) => {
    try {
      const response = await fetch(`/api/blood-pressure/${readingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReadings(prev => prev.filter(reading => reading._id !== readingId));
        toast.success('Reading deleted successfully');
      } else {
        throw new Error('Failed to delete reading');
      }
    } catch (error) {
      console.error('Error deleting reading:', error);
      toast.error('Failed to delete reading');
      throw error;
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const handleViewReading = (reading: BloodPressureReading) => {
    setSelectedReading(reading);
    setIsModalOpen(true);
    setIsEditMode(false);
  };

  const handleEditReading = (reading: BloodPressureReading) => {
    setEditingReading({ ...reading });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteReading = async (readingId: string) => {
    try {
      await deleteReading(readingId);
      setIsModalOpen(false);
      setSelectedReading(null);
      setIsEditMode(false);
      setEditingReading(null);
    } catch (error) {
      // Error is already handled in deleteReading function
    }
  };

  const handleSaveReading = async () => {
    if (!editingReading) return;

    try {
      if (editingReading._id) {
        // Update existing reading
        await updateReading(editingReading._id, editingReading);
      } else {
        // Create new reading
        await createReading(editingReading);
      }
      
      setIsEditMode(false);
      setEditingReading(null);
      setIsModalOpen(false);
    } catch (error) {
      // Error is already handled in updateReading/createReading functions
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'elevated':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'crisis':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'normal':
        return <Activity className="h-6 w-6 text-green-600" />;
      case 'elevated':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="h-6 w-6 text-orange-600" />;
      case 'crisis':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      default:
        return <Activity className="h-6 w-6 text-gray-600" />;
    }
  };

  // Calculate stats
  const latestReading = readings[0];
  const averageSystolic = readings.length > 0 
    ? Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length)
    : 0;
  const averageDiastolic = readings.length > 0 
    ? Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length)
    : 0;
  const readingsThisMonth = readings.filter(r => {
    const readingDate = new Date(r.date);
    const now = new Date();
    return readingDate.getMonth() === now.getMonth() && 
           readingDate.getFullYear() === now.getFullYear();
  }).length;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blood Pressure</h1>
            <p className="text-gray-600">Track your blood pressure readings and monitor trends</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading readings...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Blood Pressure</h1>
            <p className="text-gray-600">Track your blood pressure readings and monitor trends</p>
          </div>
        </div>
        <Link href="/dashboard/blood-pressure/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Reading
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Reading</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestReading ? `${latestReading.systolic}/${latestReading.diastolic}` : 'No readings'}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestReading && (
                <Badge variant="secondary" className="text-xs">
                  {getCategoryBadge(latestReading.category)}
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Systolic</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageSystolic}</div>
            <p className="text-xs text-muted-foreground">
              {readings.length > 0 ? `${readings.length} readings` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Diastolic</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDiastolic}</div>
            <p className="text-xs text-muted-foreground">
              {readings.length > 0 ? `${readings.length} readings` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Readings This Month</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readingsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Current month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Blood Pressure Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Pressure Trends</CardTitle>
          <CardDescription>
            Your blood pressure readings over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {readings.length > 0 ? (
            <div className="space-y-4">
              {/* Trend Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Systolic Trend</span>
                  </div>
                  <div className="text-2xl font-bold text-red-900 mt-1">
                    {readings.length > 1 ? (
                      readings[0].systolic > readings[1].systolic ? '↗️ Increasing' :
                      readings[0].systolic < readings[1].systolic ? '↘️ Decreasing' : '→ Stable'
                    ) : 'No trend data'}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Diastolic Trend</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">
                    {readings.length > 1 ? (
                      readings[0].diastolic > readings[1].diastolic ? '↗️ Increasing' :
                      readings[0].diastolic < readings[1].diastolic ? '↘️ Decreasing' : '→ Stable'
                    ) : 'No trend data'}
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Latest Category</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900 mt-1">
                    {getCategoryBadge(readings[0].category)}
                  </div>
                </div>
              </div>

              {/* Blood Pressure History Chart */}
              <div className="h-64 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Reading History</h3>
                  <span className="text-sm text-gray-500">{readings.length} readings</span>
                </div>
                
                {readings.length > 1 ? (
                  <div className="space-y-3">
                    {readings.slice(0, 8).map((reading, index) => {
                      const previousReading = readings[index + 1];
                      const systolicChange = previousReading ? reading.systolic - previousReading.systolic : 0;
                      const diastolicChange = previousReading ? reading.diastolic - previousReading.diastolic : 0;
                      
                      return (
                        <div key={reading._id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              reading.category === 'normal' ? 'bg-green-100' :
                              reading.category === 'elevated' ? 'bg-yellow-100' :
                              reading.category === 'high' ? 'bg-orange-100' :
                              'bg-red-100'
                            }`}>
                              <Activity className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{reading.systolic}/{reading.diastolic} mmHg</span>
                                {(systolicChange !== 0 || diastolicChange !== 0) && (
                                  <div className="flex items-center space-x-1">
                                    {systolicChange > 0 ? (
                                      <span className="text-xs text-red-500">↗️ +{systolicChange}</span>
                                    ) : systolicChange < 0 ? (
                                      <span className="text-xs text-green-500">↘️ {systolicChange}</span>
                                    ) : null}
                                    {diastolicChange > 0 ? (
                                      <span className="text-xs text-red-500">↗️ +{diastolicChange}</span>
                                    ) : diastolicChange < 0 ? (
                                      <span className="text-xs text-green-500">↘️ {diastolicChange}</span>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(reading.date).toLocaleDateString()} at {new Date(reading.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                {reading.pulse && (
                                  <span className="ml-2">• Pulse: {reading.pulse} bpm</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className={`text-xs ${getCategoryColor(reading.category)}`}>
                              {getCategoryBadge(reading.category)}
                            </Badge>
                            {reading.notes && (
                              <div className="text-xs text-gray-500 truncate max-w-32 mt-1">
                                {reading.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Add more readings to see trends</p>
                      <p className="text-sm">Currently showing {readings.length} reading</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Trend Analysis */}
              {readings.length > 1 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Trend Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Systolic Trend:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {readings[0].systolic > readings[1].systolic ? (
                          <span className="text-red-600 font-medium">↗️ Increasing</span>
                        ) : readings[0].systolic < readings[1].systolic ? (
                          <span className="text-green-600 font-medium">↘️ Decreasing</span>
                        ) : (
                          <span className="text-gray-600 font-medium">→ Stable</span>
                        )}
                        <span className="text-xs text-gray-500">
                          {Math.abs(readings[0].systolic - readings[1].systolic)} mmHg change
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Diastolic Trend:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {readings[0].diastolic > readings[1].diastolic ? (
                          <span className="text-red-600 font-medium">↗️ Increasing</span>
                        ) : readings[0].diastolic < readings[1].diastolic ? (
                          <span className="text-green-600 font-medium">↘️ Decreasing</span>
                        ) : (
                          <span className="text-gray-600 font-medium">→ Stable</span>
                        )}
                        <span className="text-xs text-gray-500">
                          {Math.abs(readings[0].diastolic - readings[1].diastolic)} mmHg change
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Changes */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Category Changes:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className={`text-xs ${getCategoryColor(readings[0].category)}`}>
                        Current: {getCategoryBadge(readings[0].category)}
                      </Badge>
                      {readings.length > 1 && (
                        <Badge variant="secondary" className={`text-xs ${getCategoryColor(readings[1].category)}`}>
                          Previous: {getCategoryBadge(readings[1].category)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No blood pressure readings yet</p>
                <p className="text-sm">Add your first reading to see trends</p>
                <Link href="/dashboard/blood-pressure/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Reading
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Readings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Readings</CardTitle>
          <CardDescription>
            Your latest blood pressure measurements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {readings.length > 0 ? (
            <div className="space-y-4">
              {readings.map((reading) => (
                <div key={reading._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      reading.category === 'normal' ? 'bg-green-100' :
                      reading.category === 'elevated' ? 'bg-yellow-100' :
                      reading.category === 'high' ? 'bg-orange-100' :
                      'bg-red-100'
                    }`}>
                      {getCategoryIcon(reading.category)}
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{reading.systolic}/{reading.diastolic} mmHg</p>
                      <p className="text-sm text-gray-500">
                        {new Date(reading.date).toLocaleDateString()} at {new Date(reading.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      {reading.pulse && (
                        <p className="text-xs text-gray-500">Pulse: {reading.pulse} bpm</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className={getCategoryColor(reading.category)}>
                      {getCategoryBadge(reading.category)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewReading(reading)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditReading(reading)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReading(reading._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No blood pressure readings yet</p>
              <Link href="/dashboard/blood-pressure/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Reading
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
              <span>Add Reading</span>
            </CardTitle>
            <CardDescription>
              Record a new blood pressure measurement
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
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>View Trends</span>
            </CardTitle>
            <CardDescription>
              Analyze your blood pressure patterns
            </CardDescription>
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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Set Reminders</span>
            </CardTitle>
            <CardDescription>
              Configure blood pressure check reminders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/blood-pressure/reminders">
              <Button variant="outline" className="w-full">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Set Reminders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Reading Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>{isEditMode ? 'Edit Reading' : 'Reading Details'}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedReading && !isEditMode && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedReading.systolic}/{selectedReading.diastolic} mmHg
                </h3>
                <Badge className={`mt-2 ${getCategoryColor(selectedReading.category)}`}>
                  {getCategoryBadge(selectedReading.category)}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {new Date(selectedReading.date).toLocaleDateString()} at {new Date(selectedReading.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                
                {selectedReading.pulse && (
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Pulse: {selectedReading.pulse} bpm</span>
                  </div>
                )}
                
                {selectedReading.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{selectedReading.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditReading(selectedReading)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteReading(selectedReading._id)}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
          
          {isEditMode && editingReading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="systolic">Systolic</Label>
                  <Input
                    id="systolic"
                    type="number"
                    value={editingReading.systolic}
                    onChange={(e) => setEditingReading({ ...editingReading, systolic: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="diastolic">Diastolic</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    value={editingReading.diastolic}
                    onChange={(e) => setEditingReading({ ...editingReading, diastolic: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="pulse">Pulse (optional)</Label>
                <Input
                  id="pulse"
                  type="number"
                  value={editingReading.pulse || ''}
                  onChange={(e) => setEditingReading({ ...editingReading, pulse: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date & Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={new Date(editingReading.date).toISOString().slice(0, 16)}
                  onChange={(e) => setEditingReading({ ...editingReading, date: new Date(e.target.value).toISOString() })}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={editingReading.notes || ''}
                  onChange={(e) => setEditingReading({ ...editingReading, notes: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2 pt-4 border-t">
                <Button onClick={handleSaveReading} className="flex-1">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditMode(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 