"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Plus, TrendingUp, AlertTriangle, Scale, Target, Calendar, Heart, TrendingDown, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/back-button";
import { useState, useEffect } from "react";

interface WeightRecord {
  _id: string;
  weight: number;
  height?: number;
  unit: string;
  heightUnit?: string;
  date: string;
  notes?: string;
}

interface BMIRange {
  underweight: { min: number; max: number };
  normal: { min: number; max: number };
  overweight: { min: number; max: number };
  obese: { min: number; max: number };
}

export default function WeightPage() {
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWeightRecords = async () => {
    try {
      const response = await fetch('/api/weight');
      if (response.ok) {
        const data = await response.json();
        setWeightRecords(data.data || []);
      } else {
        console.error('Failed to fetch weight records');
      }
    } catch (error) {
      console.error('Error fetching weight records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightRecords();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  const calculateTrend = (current: number, previous: number) => {
    if (!previous) return null;
    const diff = current - previous;
    const percentage = ((diff / previous) * 100).toFixed(1);
    return { diff, percentage, isPositive: diff > 0 };
  };

  const getBMIRange = (height: number, heightUnit: string) => {
    // Convert height to meters
    const heightInMeters = heightUnit === 'in' ? height * 0.0254 : height / 100;
    
    // Calculate weight ranges for each BMI category
    const underweightMax = 18.4 * (heightInMeters * heightInMeters);
    const normalMin = 18.5 * (heightInMeters * heightInMeters);
    const normalMax = 24.9 * (heightInMeters * heightInMeters);
    const overweightMin = 25.0 * (heightInMeters * heightInMeters);
    const overweightMax = 29.9 * (heightInMeters * heightInMeters);
    const obeseMin = 30.0 * (heightInMeters * heightInMeters);
    
    return {
      underweight: { min: 0, max: underweightMax },
      normal: { min: normalMin, max: normalMax },
      overweight: { min: overweightMin, max: overweightMax },
      obese: { min: obeseMin, max: Infinity }
    };
  };

  const getBMIRangeForCurrentHeight = () => {
    if (!currentWeight || !currentWeight.height) return null;
    return getBMIRange(currentWeight.height, currentWeight.heightUnit || 'in');
  };

  const getBMIRangeColor = (bmi: number, range: BMIRange) => {
    if (bmi < range.normal.min) return 'text-blue-600';
    if (bmi <= range.normal.max) return 'text-green-600';
    if (bmi <= range.overweight.max) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBMITrend = () => {
    if (weightRecords.length < 2) return null;
    const current = weightRecords[0];
    const previous = weightRecords[1];
    
    if (!current.height || !previous.height) return null;
    
    const currentBMI = calculateBMI(current.weight, current.height, current.unit, current.heightUnit || 'in');
    const previousBMI = calculateBMI(previous.weight, previous.height, previous.unit, previous.heightUnit || 'in');
    
    return calculateTrend(currentBMI, previousBMI);
  };

  const handleDelete = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this weight record?')) {
      try {
        const response = await fetch(`/api/weight/${recordId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove the record from the local state
          setWeightRecords(prev => prev.filter(record => record._id !== recordId));
        } else {
          console.error('Failed to delete weight record');
        }
      } catch (error) {
        console.error('Error deleting weight record:', error);
      }
    }
  };

  // Calculate stats
  const currentWeight = weightRecords[0];
  const previousWeight = weightRecords[1];
  
  const weightChange = currentWeight && previousWeight 
    ? currentWeight.weight - previousWeight.weight 
    : 0;

  const currentBMI = currentWeight && currentWeight.height
    ? calculateBMI(currentWeight.weight, currentWeight.height, currentWeight.unit, currentWeight.heightUnit || 'in')
    : 0;

  const previousBMI = previousWeight && previousWeight.height
    ? calculateBMI(previousWeight.weight, previousWeight.height, previousWeight.unit, previousWeight.heightUnit || 'in')
    : 0;

  const bmiChange = currentBMI - previousBMI;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Weight Tracking</h1>
              <p className="text-gray-600">Monitor your weight and BMI</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading weight records...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Weight Tracking</h1>
            <p className="text-gray-600">Monitor your weight and BMI</p>
          </div>
        </div>
        <Link href="/dashboard/weight/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Reading
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight & Height</CardTitle>
            <Heart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {currentWeight ? (
              <>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">{currentWeight.weight} {currentWeight.unit}</div>
                    <p className="text-xs text-muted-foreground">
                      {weightChange !== 0 && (
                        <span className={weightChange > 0 ? "text-red-600" : "text-green-600"}>
                          {weightChange > 0 ? "↑" : "↓"} {Math.abs(weightChange).toFixed(1)} {currentWeight.unit}
                        </span>
                      )}
                      <span className="ml-2">Recorded on {formatDate(currentWeight.date)}</span>
                    </p>
                  </div>
                  {currentWeight.height && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="text-lg font-semibold">{currentWeight.height} {currentWeight.heightUnit || 'in'}</div>
                      <p className="text-xs text-muted-foreground">
                        Height for BMI calculation
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-400">No records</div>
                <p className="text-xs text-muted-foreground">
                  Add your first weight record
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BMI</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {currentBMI > 0 ? (
              <>
                <div className="text-2xl font-bold">{currentBMI.toFixed(1)}</div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary" className={`text-xs ${getBMICategory(currentBMI).color}`}>
                    {getBMICategory(currentBMI).category}
                  </Badge>
                  {getBMITrend() && (
                    <div className="flex items-center space-x-1">
                      {getBMITrend()?.isPositive ? (
                        <ArrowUp className="h-3 w-3 text-red-500" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-green-500" />
                      )}
                      <span className={`text-xs ${getBMITrend()?.isPositive ? 'text-red-500' : 'text-green-500'}`}>
                        {Math.abs(getBMITrend()?.diff || 0).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* BMI Reference Ranges */}
                {getBMIRangeForCurrentHeight() && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-700 mb-2">Acceptable Weight Range for Your Height</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-blue-600">Underweight:</span>
                        <span className="text-gray-600">
                          {getBMIRangeForCurrentHeight()?.underweight.max.toFixed(1)} {currentWeight?.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Normal:</span>
                        <span className="text-gray-600">
                          {getBMIRangeForCurrentHeight()?.normal.min.toFixed(1)} - {getBMIRangeForCurrentHeight()?.normal.max.toFixed(1)} {currentWeight?.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-600">Overweight:</span>
                        <span className="text-gray-600">
                          {getBMIRangeForCurrentHeight()?.overweight.min.toFixed(1)} - {getBMIRangeForCurrentHeight()?.overweight.max.toFixed(1)} {currentWeight?.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Obese:</span>
                        <span className="text-gray-600">
                          {getBMIRangeForCurrentHeight()?.obese.min.toFixed(1)}+ {currentWeight?.unit}
                        </span>
                      </div>
                    </div>
                    
                    {/* Current position indicator */}
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Your current weight:</span>
                        <span className={`text-xs font-medium ${getBMIRangeColor(currentBMI, getBMIRangeForCurrentHeight()!)}`}>
                          {currentWeight?.weight} {currentWeight?.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-2">
                  Height: {currentWeight?.height} {currentWeight?.heightUnit || 'in'}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-400">No data</div>
                <p className="text-xs text-muted-foreground">
                  Add weight and height record
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Progress</CardTitle>
          <CardDescription>
            Your weight tracking over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weightRecords.length > 0 ? (
            <div className="space-y-4">
              {/* Weight Trend Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Scale className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Total Records</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">{weightRecords.length}</div>
                </div>
                
                {weightRecords.length > 1 && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Weight Change</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900 mt-1">
                        {weightChange > 0 ? '+' : ''}{weightChange.toFixed(2)} {currentWeight?.unit}
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">BMI Change</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-900 mt-1">
                        {bmiChange > 0 ? '+' : ''}{bmiChange.toFixed(2)}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Weight History Chart */}
              <div className="h-64 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Weight History</h3>
                  <span className="text-sm text-gray-500">{weightRecords.length} records</span>
                </div>
                
                {weightRecords.length > 1 ? (
                  <div className="space-y-3">
                    {weightRecords.slice(0, 5).map((record, index) => {
                      const previousRecord = weightRecords[index + 1];
                      const weightTrend = previousRecord ? calculateTrend(record.weight, previousRecord.weight) : null;
                      const bmi = record.height 
                        ? calculateBMI(record.weight, record.height, record.unit, record.heightUnit || 'in')
                        : 0;
                      
                      return (
                        <div key={record._id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <Scale className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{record.weight} {record.unit}</span>
                                {weightTrend && (
                                  <div className="flex items-center space-x-1">
                                    {weightTrend.isPositive ? (
                                      <ArrowUp className="h-3 w-3 text-red-500" />
                                    ) : (
                                      <ArrowDown className="h-3 w-3 text-green-500" />
                                    )}
                                    <span className={`text-xs ${weightTrend.isPositive ? 'text-red-500' : 'text-green-500'}`}>
                                      {Math.abs(weightTrend.diff).toFixed(2)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(record.date)}
                                {bmi > 0 && (
                                  <span className="ml-2">• BMI: {bmi.toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {record.height ? `${record.height} ${record.heightUnit || 'in'}` : 'No height'}
                            </div>
                            {record.notes && (
                              <div className="text-xs text-gray-500 truncate max-w-32">
                                {record.notes}
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
                      <p>Add more weight records to see trends</p>
                      <p className="text-sm">Currently showing {weightRecords.length} record</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Trend Analysis */}
              {weightRecords.length > 1 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Trend Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Weight Trend:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {weightChange > 0 ? (
                          <ArrowUp className="h-4 w-4 text-red-500" />
                        ) : weightChange < 0 ? (
                          <ArrowDown className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                        <span className={`font-medium ${weightChange > 0 ? 'text-red-600' : weightChange < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                          {weightChange > 0 ? 'Gaining' : weightChange < 0 ? 'Losing' : 'Stable'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">BMI Trend:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {bmiChange > 0 ? (
                          <ArrowUp className="h-4 w-4 text-red-500" />
                        ) : bmiChange < 0 ? (
                          <ArrowDown className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                        <span className={`font-medium ${bmiChange > 0 ? 'text-red-600' : bmiChange < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                          {bmiChange > 0 ? 'Increasing' : bmiChange < 0 ? 'Decreasing' : 'Stable'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Scale className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No weight records yet</p>
                <p className="text-sm">Add your first weight reading to see progress</p>
                <Link href="/dashboard/weight/new">
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

      {/* Recent Weight Records */}
      {weightRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Weight Records</CardTitle>
            <CardDescription>
              Your latest weight and height measurements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weightRecords.slice(0, 5).map((record, index) => {
                const bmi = record.height 
                  ? calculateBMI(record.weight, record.height, record.unit, record.heightUnit || 'in')
                  : 0;
                
                // Calculate trend from previous record
                const previousRecord = weightRecords[index + 1];
                const weightTrend = previousRecord ? calculateTrend(record.weight, previousRecord.weight) : null;
                
                return (
                  <div key={record._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Scale className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-lg font-semibold">{record.weight} {record.unit}</p>
                          {weightTrend && (
                            <div className="flex items-center space-x-1">
                              {weightTrend.isPositive ? (
                                <ArrowUp className="h-3 w-3 text-red-500" />
                              ) : (
                                <ArrowDown className="h-3 w-3 text-green-500" />
                              )}
                              <span className={`text-xs ${weightTrend.isPositive ? 'text-red-500' : 'text-green-500'}`}>
                                {Math.abs(weightTrend.diff).toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(record.date)}
                          {record.height && (
                            <span className="ml-2">• Height: {record.height} {record.heightUnit || 'in'}</span>
                          )}
                          {bmi > 0 && (
                            <span className="ml-2">• BMI: {bmi.toFixed(1)}</span>
                          )}
                        </p>
                        {record.notes && (
                          <p className="text-xs text-gray-500">{record.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Record #{weightRecords.length - index}</Badge>
                      <Link href={`/dashboard/weight/edit/${record._id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(record._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-orange-500" />
              <span>Add Weight Reading</span>
            </CardTitle>
            <CardDescription>
              Record your current weight and height
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/weight/new">
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
              Analyze your weight and BMI trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/weight/trends">
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