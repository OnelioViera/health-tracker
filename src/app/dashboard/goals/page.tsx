"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Edit,
  Trash2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import BackButton from "@/components/back-button";

interface HealthGoal {
  _id: string;
  title: string;
  description: string;
  category: 'weight' | 'blood-pressure' | 'exercise' | 'nutrition' | 'general';
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'overdue';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface GoalData {
  title: string;
  description: string;
  category: 'weight' | 'blood-pressure' | 'exercise' | 'nutrition' | 'general';
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  targetDate: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<HealthGoal | null>(null);
  const [newGoal, setNewGoal] = useState<GoalData>({
    title: '',
    description: '',
    category: 'general',
    targetValue: 0,
    currentValue: 0,
    unit: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Helper function to safely parse number inputs
  const parseNumberInput = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper function to format number for display
  const formatNumberForDisplay = (value: number): string => {
    return value === 0 ? '' : value.toString();
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data.data || []);
      } else {
        console.error('Failed to fetch goals');
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async (goalData: GoalData) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      if (response.ok) {
        const newGoal = await response.json();
        setGoals(prev => [newGoal, ...prev]);
        toast.success('Goal created successfully');
        return newGoal;
      } else {
        throw new Error('Failed to create goal');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
      throw error;
    }
  };

  const updateGoal = async (goalId: string, goalData: GoalData) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoals(prev => prev.map(goal => 
          goal._id === goalId ? updatedGoal : goal
        ));
        toast.success('Goal updated successfully');
        return updatedGoal;
      } else {
        throw new Error('Failed to update goal');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
      throw error;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGoals(prev => prev.filter(goal => goal._id !== goalId));
        toast.success('Goal deleted successfully');
      } else {
        throw new Error('Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
      throw error;
    }
  };

  const handleCreateGoal = async () => {
    try {
      await createGoal(newGoal);
      setIsCreateModalOpen(false);
      setNewGoal({
        title: '',
        description: '',
        category: 'general',
        targetValue: 0,
        currentValue: 0,
        unit: '',
        startDate: new Date().toISOString().split('T')[0],
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    } catch (error) {
      // Error is already handled in createGoal function
    }
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal) return;

    try {
      await updateGoal(editingGoal._id, editingGoal);
      setIsEditModalOpen(false);
      setEditingGoal(null);
    } catch (error) {
      // Error is already handled in updateGoal function
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(goalId);
      } catch (error) {
        // Error is already handled in deleteGoal function
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weight':
        return <TrendingDown className="h-5 w-5 text-orange-500" />;
      case 'blood-pressure':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'exercise':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'nutrition':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Target className="h-5 w-5 text-purple-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weight':
        return 'warning';
      case 'blood-pressure':
        return 'danger';
      case 'exercise':
        return 'success';
      case 'nutrition':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'overdue':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const calculateProgress = (goal: HealthGoal) => {
    // Handle edge cases that could result in NaN
    if (!goal.targetValue || goal.targetValue === 0) {
      return 0;
    }
    
    if (!goal.currentValue || isNaN(goal.currentValue)) {
      return 0;
    }
    
    const progress = (goal.currentValue / goal.targetValue) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Goals</h1>
            <p className="text-gray-600">Set and track your health objectives</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading goals...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Health Goals</h1>
            <p className="text-gray-600">Set and track your health objectives</p>
          </div>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Lose 10 pounds"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Describe your goal..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newGoal.category} onValueChange={(value: 'weight' | 'blood-pressure' | 'exercise' | 'nutrition' | 'general') => setNewGoal({ ...newGoal, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">Weight Management</SelectItem>
                    <SelectItem value="blood-pressure">Blood Pressure</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="general">General Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentValue">Current Value</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    value={formatNumberForDisplay(newGoal.currentValue)}
                    onChange={(e) => setNewGoal({ ...newGoal, currentValue: parseNumberInput(e.target.value) })}
                    placeholder="e.g., 160"
                  />
                </div>
                <div>
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={formatNumberForDisplay(newGoal.targetValue)}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseNumberInput(e.target.value) })}
                    placeholder="e.g., 150"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                  placeholder="e.g., lbs, mmHg, minutes"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newGoal.startDate}
                    onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleCreateGoal} className="flex-1">
                  Create Goal
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">
              {goals.filter(g => g.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.filter(g => g.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">
              {goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.filter(g => g.status === 'overdue').length}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + calculateProgress(goal), 0) / goals.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <Card key={goal._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{goal.title}</h3>
                        <Badge variant={getCategoryColor(goal.category) as "warning" | "danger" | "success" | "info" | "secondary"}>
                          {goal.category.charAt(0).toUpperCase() + goal.category.slice(1).replace('-', ' ')}
                        </Badge>
                        <Badge variant={getStatusColor(goal.status) as "success" | "danger" | "info"}>
                          {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{goal.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{calculateProgress(goal).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={calculateProgress(goal)} 
                          variant={goal.status === 'completed' ? 'success' : goal.status === 'overdue' ? 'danger' : 'info'}
                          className="h-2" 
                        />
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{goal.currentValue} {goal.unit}</span>
                          <ArrowRight className="h-4 w-4" />
                          <span>{goal.targetValue} {goal.unit}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-4 text-xs text-gray-500">
                        <span>Start: {new Date(goal.startDate).toLocaleDateString()}</span>
                        <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        <span>{getDaysRemaining(goal.targetDate)} days remaining</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingGoal(goal);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
              <p className="text-gray-600 mb-4">Start by creating your first health goal</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Goal Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Goal Title</Label>
                <Input
                  id="edit-title"
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingGoal.description}
                  onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-currentValue">Current Value</Label>
                  <Input
                    id="edit-currentValue"
                    type="number"
                    value={formatNumberForDisplay(editingGoal.currentValue)}
                    onChange={(e) => setEditingGoal({ ...editingGoal, currentValue: parseNumberInput(e.target.value) })}
                    placeholder="e.g., 160"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-targetValue">Target Value</Label>
                  <Input
                    id="edit-targetValue"
                    type="number"
                    value={formatNumberForDisplay(editingGoal.targetValue)}
                    onChange={(e) => setEditingGoal({ ...editingGoal, targetValue: parseNumberInput(e.target.value) })}
                    placeholder="e.g., 150"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleUpdateGoal} className="flex-1">
                  Update Goal
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
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