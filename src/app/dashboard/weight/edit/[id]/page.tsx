"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/back-button";

interface WeightRecord {
  _id: string;
  weight: number;
  height?: number;
  unit: string;
  heightUnit?: string;
  date: string;
  notes?: string;
}

export default function EditWeightPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    unit: "lbs",
    heightUnit: "in",
    date: "",
    time: "",
    notes: "",
  });

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/weight/${recordId}`);
        if (response.ok) {
          const record: WeightRecord = await response.json();
          const date = new Date(record.date);
          setFormData({
            weight: record.weight.toString(),
            height: record.height?.toString() || "70", // Default height if missing
            unit: record.unit,
            heightUnit: record.heightUnit || "in", // Default height unit if missing
            date: date.toISOString().split('T')[0],
            time: date.toTimeString().slice(0, 5),
            notes: record.notes || "",
          });
        } else {
          console.error('Failed to fetch weight record');
          router.push('/dashboard/weight');
        }
      } catch (error) {
        console.error('Error fetching weight record:', error);
        router.push('/dashboard/weight');
      } finally {
        setIsLoading(false);
      }
    };

    if (recordId) {
      fetchRecord();
    }
  }, [recordId, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    
    if (weight && height) {
      let heightInMeters, weightInKg;
      
      // Convert height to meters
      if (formData.heightUnit === 'in') {
        heightInMeters = height * 0.0254; // inches to meters
      } else {
        heightInMeters = height / 100; // cm to meters
      }
      
      // Convert weight to kg
      if (formData.unit === 'lbs') {
        weightInKg = weight * 0.453592; // lbs to kg
      } else {
        weightInKg = weight; // already in kg
      }
      
      const bmi = weightInKg / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { category: 'Obese', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Validate required fields
      if (!formData.weight) {
        alert('Please enter your weight.');
        return;
      }

      // Validate numeric values
      const weight = parseFloat(formData.weight);
      
      if (isNaN(weight)) {
        alert('Please enter a valid numeric value for weight.');
        return;
      }

      // Validate weight range
      if (weight < 20 || weight > 500) {
        alert('Weight must be between 20 and 500.');
        return;
      }

      // Validate height if provided
      let height = null;
      if (formData.height) {
        height = parseFloat(formData.height);
        
        if (isNaN(height)) {
          alert('Please enter a valid numeric value for height.');
          return;
        }

        // Validate height range based on unit
        if (formData.heightUnit === 'in') {
          if (height < 30 || height > 100) {
            alert('Height must be between 30 and 100 inches.');
            return;
          }
        } else if (formData.heightUnit === 'cm') {
          if (height < 76 || height > 254) {
            alert('Height must be between 76 and 254 centimeters.');
            return;
          }
        }
      }

      // Create a proper date object and convert to ISO string to avoid timezone issues
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const response = await fetch(`/api/weight/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          weight: weight,
          height: height,
          date: dateTime.toISOString(),
        }),
      });

      if (response.ok) {
        router.push('/dashboard/weight');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update weight record:', errorData);
        alert(`Failed to update weight record: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating weight record:', error);
      alert('Failed to update weight record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading weight record...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Weight Record</h1>
          <p className="text-gray-600">Update your weight and height data</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-orange-500" />
              <span>Weight & Height</span>
            </CardTitle>
            <CardDescription>
              Update your weight and height for accurate BMI calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="165.0"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Weight Unit</Label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (Optional)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder={formData.heightUnit === 'in' ? "70.0" : "175.0"}
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heightUnit">Height Unit</Label>
                <Select value={formData.heightUnit} onValueChange={(value) => handleInputChange('heightUnit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Inches (in)</SelectItem>
                    <SelectItem value="cm">Centimeters (cm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* BMI Calculation */}
            {bmi ? (
              <div className={`p-4 ${bmiCategory?.bgColor} rounded-lg border`}>
                <h4 className="font-medium mb-2">Calculated BMI</h4>
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold">{bmi}</span>
                  {bmiCategory && (
                    <span className={`font-medium ${bmiCategory.color} px-3 py-1 rounded-full text-sm`}>
                      {bmiCategory.category}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Based on your weight of {formData.weight} {formData.unit} and height of {formData.height} {formData.heightUnit}
                </p>
              </div>
            ) : formData.weight && !formData.height ? (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium mb-2 text-blue-800">BMI Calculation</h4>
                <p className="text-sm text-blue-600">
                  Enter your height to calculate BMI and track your body composition.
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any notes about this measurement (e.g., after workout, morning weight, etc.)"
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
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Record
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 