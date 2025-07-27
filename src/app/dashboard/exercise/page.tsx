"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mountain, 
  Calendar, 
  Clock, 
  MapPin, 
  Thermometer, 
  TrendingUp, 
  Activity,
  Heart,
  Zap,
  RefreshCw,
  Plus,
  ArrowUp,
  ArrowDown,
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import BackButton from "@/components/back-button";
import Link from "next/link";

interface Exercise {
  _id: string;
  activityType: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  distance: number;
  distanceUnit: string;
  calories: number;
  heartRate: {
    average?: number;
    max?: number;
    min?: number;
  };
  elevation: {
    gain?: number;
    loss?: number;
  };
  location: {
    name?: string;
  };
  weather: {
    temperature?: number;
    conditions?: string;
  };
  difficulty: string;
  mood: string;
  source: string;
  notes?: string;
  photos?: Array<{
    url: string;
    caption: string;
  }>;
}

export default function ExercisePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<{
    available: boolean;
    message: string;
    recommendation: string;
    authentication?: {
      method: 'user-api-key' | 'env-api-token' | 'default-token';
      hasValidAuth: boolean;
    };
  } | null>(null);

  useEffect(() => {
    fetchExercises();
    checkIntegrationStatus();
  }, []);

  const checkIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/hiking-journal-status');
      if (response.ok) {
        const data = await response.json();
        setIntegrationStatus({
          available: data.status?.available || false,
          message: data.message || 'Status unknown',
          recommendation: data.recommendation || 'Check the integration setup',
          authentication: data.authentication || { method: 'default-token', hasValidAuth: false },
        });
      }
    } catch (error) {
      console.error('Error checking integration status:', error);
      setIntegrationStatus({
        available: false,
        message: 'Failed to check integration status',
        recommendation: 'The Hiking Journal app may be down or unreachable.',
        authentication: { method: 'default-token', hasValidAuth: false },
      });
    }
  };

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/exercise');
      if (response.ok) {
        const data = await response.json();
        setExercises(data.data || []);
      } else {
        console.error('Failed to fetch exercises');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromHikingJournal = async (force = false, cleanup = false) => {
    setIsSyncing(true);
    try {
      let url = '/api/sync-exercise';
      const params = new URLSearchParams();
      if (force) params.append('force', 'true');
      if (cleanup) params.append('cleanup', 'true');
      if (params.toString()) url += '?' + params.toString();
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.source === 'mock-data') {
          toast.success(result.message, {
            description: 'The Hiking Journal API is not available, but you can still view demo data.',
            duration: 5000,
          });
        } else {
          toast.success(result.message);
        }
        // Refresh the exercise list
        await fetchExercises();
      } else {
        // Handle error response
        const errorMessage = result.error || result.message || 'Sync failed';
        toast.error(errorMessage, {
          description: result.details || 'Please check the Hiking Journal integration setup.',
          duration: 6000,
        });
      }
    } catch (error) {
      console.error('Error syncing exercises:', error);
      toast.error('Failed to sync exercises', {
        description: 'Network error or server issue. Please try again.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncClick = (e: React.MouseEvent) => {
    e.preventDefault();
    syncFromHikingJournal(false, false);
  };

  const handleDedicatedCleanup = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      const response = await fetch('/api/cleanup-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message);
        // Refresh the exercise list
        await fetchExercises();
      } else {
        const errorMessage = result.error || result.message || 'Cleanup failed';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error cleaning up exercises:', error);
      toast.error('Failed to clean up exercises', {
        description: 'Network error or server issue. Please try again.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'moderate':
        return 'warning';
      case 'hard':
        return 'danger';
      case 'extreme':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'great':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'okay':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'tough':
        return <ArrowDown className="h-4 w-4 text-orange-500" />;
      case 'exhausted':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getWeatherIcon = (conditions?: string) => {
    if (!conditions) return <Cloud className="h-4 w-4" />;
    
    const lowerConditions = conditions.toLowerCase();
    if (lowerConditions.includes('sunny') || lowerConditions.includes('clear')) {
      return <Sun className="h-4 w-4 text-yellow-500" />;
    } else if (lowerConditions.includes('rain') || lowerConditions.includes('shower')) {
      return <CloudRain className="h-4 w-4 text-blue-500" />;
    } else if (lowerConditions.includes('snow')) {
      return <Snowflake className="h-4 w-4 text-blue-400" />;
    } else {
      return <Cloud className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateStats = () => {
    if (exercises.length === 0) return null;

    const totalDistance = exercises.reduce((sum, ex) => sum + ex.distance, 0);
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const totalCalories = exercises.reduce((sum, ex) => sum + (ex.calories || 0), 0);
    const avgHeartRate = exercises
      .filter(ex => ex.heartRate?.average)
      .reduce((sum, ex) => sum + (ex.heartRate?.average || 0), 0) / 
      exercises.filter(ex => ex.heartRate?.average).length;

    return {
      totalDistance,
      totalDuration,
      totalCalories,
      avgHeartRate: avgHeartRate || 0,
      totalActivities: exercises.length
    };
  };

  const stats = calculateStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'planned':
        return 'info';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exercise & Activities</h1>
            <p className="text-gray-600">Track your hiking and fitness activities</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading exercise data...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Exercise & Activities</h1>
            <p className="text-gray-600">Track your hiking and fitness activities</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSyncClick} disabled={isSyncing}>
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Mountain className="h-4 w-4 mr-2" />
                Sync from Hiking Journal
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={handleDedicatedCleanup} disabled={isSyncing}>
            <Trash2 className="h-4 w-4 mr-2" />
            Remove All Mock Data
          </Button>
          <Button onClick={fetchExercises}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mountain className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold">{stats.totalActivities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Distance</p>
                  <p className="text-2xl font-bold">{stats.totalDistance.toFixed(1)} mi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Time</p>
                  <p className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Calories Burned</p>
                  <p className="text-2xl font-bold">{stats.totalCalories.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Integration Status */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Mountain className={`h-5 w-5 ${integrationStatus?.available ? 'text-green-600' : integrationStatus?.message?.includes('authentication') ? 'text-yellow-600' : 'text-gray-400'}`} />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Hiking Journal Integration</h3>
              <p className="text-sm text-gray-600 mb-2">
                {integrationStatus?.message || 'Checking integration status...'}
              </p>
              <p className="text-xs text-gray-500">
                {integrationStatus?.recommendation || 'Loading recommendation...'}
              </p>
              {integrationStatus?.authentication?.method === 'user-api-key' && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ Using your personal API key
                </p>
              )}
              {integrationStatus?.authentication?.method === 'env-api-token' && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ Using environment variable (consider setting personal API key)
                </p>
              )}
              {integrationStatus?.authentication?.method === 'default-token' && (
                <p className="text-xs text-red-600 mt-1">
                  ❌ No API key configured
                </p>
              )}
            </div>
            <Badge variant={
              integrationStatus?.available ? "default" : 
              integrationStatus?.message?.includes('authentication') ? "secondary" : 
              "secondary"
            }>
              {integrationStatus?.available ? "Available" : 
               integrationStatus?.message?.includes('authentication') ? "Auth Required" : 
               "Unavailable"}
            </Badge>
          </div>
          {integrationStatus && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>API Endpoint: hiking-journal-amber.vercel.app/api/activities</span>
                  <span>Status: {
                    integrationStatus.available ? "✅ Online" : 
                    integrationStatus.message?.includes('authentication') ? "🔐 Requires Auth" : 
                    "❌ Not Found"
                  }</span>
                </div>
                {!integrationStatus.authentication?.hasValidAuth && (
                  <Link href="/user-settings">
                    <Button variant="outline" size="sm" className="text-xs">
                      Configure API Key
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Activities</h2>
          <Badge variant="secondary">{exercises.length} activities</Badge>
        </div>

        {exercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <Card key={exercise._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {formatDate(exercise.date)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getMoodIcon(exercise.mood)}
                      <Badge variant={getDifficultyColor(exercise.difficulty)}>
                        {exercise.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{exercise.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{formatDuration(exercise.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mountain className="h-4 w-4 text-gray-400" />
                      <span>{exercise.distance} {exercise.distanceUnit}</span>
                    </div>
                    {exercise.calories > 0 && (
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-gray-400" />
                        <span>{exercise.calories} cal</span>
                      </div>
                    )}
                    {exercise.location?.name && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{exercise.location.name}</span>
                      </div>
                    )}
                  </div>

                  {exercise.elevation?.gain && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Elevation Gain:</span>
                      <span className="font-medium">{exercise.elevation.gain} ft</span>
                    </div>
                  )}

                  {exercise.weather?.temperature && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {getWeatherIcon(exercise.weather.conditions)}
                        <span className="text-gray-600">Weather:</span>
                      </div>
                      <span className="font-medium">
                        {exercise.weather.temperature}°F
                        {exercise.weather.conditions && `, ${exercise.weather.conditions}`}
                      </span>
                    </div>
                  )}

                  {exercise.heartRate?.average && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-400" />
                        <span className="text-gray-600">Heart Rate:</span>
                      </div>
                      <span className="font-medium">{exercise.heartRate.average} bpm</span>
                    </div>
                  )}

                  {exercise.source === 'hiking-journal' && (
                    <div className="flex items-center space-x-2 text-xs text-blue-600">
                      <Mountain className="h-3 w-3" />
                      <span>Synced from Hiking Journal</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Mountain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities yet</h3>
              <p className="text-gray-600 mb-4">
                {integrationStatus?.message?.includes('authentication') 
                  ? 'The Hiking Journal API requires authentication. You can create demo data to see how the exercise tracking works.'
                  : 'The Hiking Journal integration is currently unavailable. You can create demo data to see how the exercise tracking works.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={handleSyncClick}>
                  <Mountain className="h-4 w-4 mr-2" />
                  Sync from Hiking Journal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 