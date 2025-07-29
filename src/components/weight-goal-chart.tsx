"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Target, Scale } from "lucide-react";

interface WeightGoalChartProps {
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  unit: string;
  progress: number;
  daysRemaining: number;
  startDate: string;
  targetDate: string;
}

export default function WeightGoalChart({
  startWeight,
  currentWeight,
  targetWeight,
  unit,
  progress,
  daysRemaining,
  startDate,
  targetDate
}: WeightGoalChartProps) {
  const weightLost = startWeight - currentWeight;
  const totalWeightToLose = startWeight - targetWeight;
  const remainingWeight = currentWeight - targetWeight;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scale className="h-5 w-5 text-blue-600" />
          <span>Weight Goal Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="font-bold text-blue-600">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Weight Visualization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{startWeight}</div>
              <div className="text-sm text-gray-500">Start Weight ({unit})</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {weightLost > 0 ? `-${weightLost.toFixed(1)}` : '0.0'}
                </div>
                <div className="text-xs text-gray-500">Lost</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentWeight}</div>
              <div className="text-sm text-gray-500">Current ({unit})</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-purple-600" />
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {remainingWeight > 0 ? remainingWeight.toFixed(1) : '0.0'}
                </div>
                <div className="text-xs text-gray-500">To Go</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{targetWeight}</div>
              <div className="text-sm text-gray-500">Target ({unit})</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Timeline</span>
            <span className="font-medium">{daysRemaining} days remaining</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Start: {new Date(startDate).toLocaleDateString()}</span>
            <span>Target: {new Date(targetDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {totalWeightToLose > 0 ? totalWeightToLose.toFixed(1) : '0.0'} {unit}
            </div>
            <div className="text-xs text-gray-500">Total to lose</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {progress.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 