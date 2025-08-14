"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity, Save } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/back-button";

export default function NewBloodPressurePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper functions for time format conversion
  const convert24HourTo12Hour = (time24Hour: string): string => {
    const [hours, minutes] = time24Hour.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const convert12HourTo24Hour = (time12Hour: string): string => {
    const match = time12Hour.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return time12Hour; // Return as-is if not in expected format
    
    let hour = parseInt(match[1]);
    const minute = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    date: new Date().toISOString().slice(0, 10), // Just the date part
    time: convert24HourTo12Hour(new Date().toTimeString().slice(0, 5)), // Convert to 12-hour format
    notes: ""
  });

  const [category, setCategory] = useState("normal");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Calculate category based on blood pressure values
    if (field === 'systolic' || field === 'diastolic') {
      const systolic = field === 'systolic' ? parseInt(value) : parseInt(formData.systolic);
      const diastolic = field === 'diastolic' ? parseInt(value) : parseInt(formData.diastolic);
      
      if (!isNaN(systolic) && !isNaN(diastolic)) {
        if (systolic < 120 && diastolic < 80) {
          setCategory("normal");
        } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
          setCategory("elevated");
        } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
          setCategory("high");
        } else if (systolic >= 140 || diastolic >= 90) {
          setCategory("crisis");
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Combine date and time into a single ISO string
      const dateTimeString = `${formData.date}T${convert12HourTo24Hour(formData.time)}:00`;
      const dateTime = new Date(dateTimeString);
      
      const response = await fetch('/api/blood-pressure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          systolic: parseInt(formData.systolic),
          diastolic: parseInt(formData.diastolic),
          pulse: formData.pulse ? parseInt(formData.pulse) : undefined,
          date: dateTime.toISOString()
        }),
      });

      if (response.ok) {
        toast.success('Blood pressure reading recorded successfully!');
        router.push('/dashboard/blood-pressure');
      } else {
        toast.error('Failed to record blood pressure reading');
      }
    } catch (error) {
      console.error('Error recording blood pressure reading:', error);
      toast.error('Failed to record blood pressure reading');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'normal': return 'success';
      case 'elevated': return 'warning';
      case 'high': return 'danger';
      case 'crisis': return 'danger';
      default: return 'secondary';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'normal': return 'Normal';
      case 'elevated': return 'Elevated';
      case 'high': return 'High';
      case 'crisis': return 'Crisis';
      default: return 'Unknown';
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Blood Pressure Reading</h1>
          <p className="text-gray-600">Record a new blood pressure measurement</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-red-500" />
              <span>Blood Pressure Reading</span>
            </CardTitle>
            <CardDescription>
              Enter your blood pressure values and additional details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Blood Pressure Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systolic">Systolic (mmHg)</Label>
                <Input
                  id="systolic"
                  type="number"
                  placeholder="120"
                  min="70"
                  max="200"
                  value={formData.systolic}
                  onChange={(e) => handleInputChange('systolic', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
                <Input
                  id="diastolic"
                  type="number"
                  placeholder="80"
                  min="40"
                  max="130"
                  value={formData.diastolic}
                  onChange={(e) => handleInputChange('diastolic', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pulse">Pulse (bpm)</Label>
                <Input
                  id="pulse"
                  type="number"
                  placeholder="72"
                  min="40"
                  max="200"
                  value={formData.pulse}
                  onChange={(e) => handleInputChange('pulse', e.target.value)}
                />
              </div>
            </div>

            {/* Category Display */}
            {formData.systolic && formData.diastolic && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Category:</span>
                <Badge className={getCategoryColor(category)}>
                  {getCategoryLabel(category)}
                </Badge>
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="flex space-x-2">
                  <Select 
                    value={formData.time ? formData.time.split(':')[0] : '12'}
                    onValueChange={(hour) => {
                      const currentTime = formData.time || '12:00 AM';
                      const [, minute, period] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['', '00', 'AM'];
                      handleInputChange('time', `${hour}:${minute} ${period}`);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 12}, (_, i) => i + 1).map(hour => (
                        <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="flex items-center">:</span>
                  <Select 
                    value={formData.time ? formData.time.split(':')[1]?.split(' ')[0] : '00'}
                    onValueChange={(minute) => {
                      const currentTime = formData.time || '12:00 AM';
                      const [hour, , period] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['12', '00', 'AM'];
                      handleInputChange('time', `${hour}:${minute} ${period}`);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 60}, (_, i) => i).map(minute => (
                        <SelectItem key={minute} value={minute.toString().padStart(2, '0')}>
                          {minute.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={formData.time ? formData.time.split(' ')[1] : 'AM'}
                    onValueChange={(period) => {
                      const currentTime = formData.time || '12:00 AM';
                      const [hour, minute] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['12', '00'];
                      handleInputChange('time', `${hour}:${minute} ${period}`);
                    }}
                  >
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this reading..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            Save Reading
          </Button>
        </div>
      </form>
    </div>
  );
} 