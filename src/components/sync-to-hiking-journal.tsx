"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, ArrowRight, CheckCircle, Activity, Scale, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function SyncToHikingJournal() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const syncToHikingJournal = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/export-health-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetApp: 'hiking-journal',
          dataTypes: ['weight', 'bloodPressure', 'goals'],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLastSync(new Date().toLocaleString());
        toast.success('Data synced to Hiking Journal successfully!');
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Failed to sync data');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mountain className="h-5 w-5 text-green-500" />
          <span>Sync to Hiking Journal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Sync your health data to your Hiking Journal app for comprehensive tracking.
        </p>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Scale className="h-3 w-3" />
            <span>Weight</span>
          </div>
          <div className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>Blood Pressure</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="h-3 w-3" />
            <span>Goals</span>
          </div>
        </div>
        
        <Button 
          onClick={syncToHikingJournal} 
          disabled={isSyncing}
          className="w-full"
        >
          {isSyncing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Syncing...
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4 mr-2" />
              Sync Now
            </>
          )}
        </Button>
        
        {lastSync && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <CheckCircle className="h-3 w-3" />
            <span>Last synced: {lastSync}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 