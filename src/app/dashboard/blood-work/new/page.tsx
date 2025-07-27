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
import { TrendingUp, ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/back-button";

interface BloodWorkResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: { min: string; max: string };
  status: 'normal' | 'low' | 'high' | 'critical';
}

export default function NewBloodWorkPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    testName: "",
    testDate: new Date().toISOString().split('T')[0],
    labName: "",
    doctorName: "",
    notes: "",
    category: "basic",
  });

  const [results, setResults] = useState<BloodWorkResult[]>([
    {
      parameter: "",
      value: "",
      unit: "",
      referenceRange: { min: "", max: "" },
      status: 'normal',
    }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResultChange = (index: number, field: string, value: string) => {
    const newResults = [...results];
    if (field === 'referenceRange') {
      // Handle reference range separately
      return;
    }
    newResults[index] = { ...newResults[index], [field]: value };
    setResults(newResults);
  };

  const handleReferenceRangeChange = (index: number, field: 'min' | 'max', value: string) => {
    const newResults = [...results];
    newResults[index].referenceRange[field] = value;
    setResults(newResults);
  };

  const addResult = () => {
    setResults([...results, {
      parameter: "",
      value: "",
      unit: "",
      referenceRange: { min: "", max: "" },
      status: 'normal',
    }]);
  };

  const removeResult = (index: number) => {
    if (results.length > 1) {
      setResults(results.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/blood-work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          testDate: new Date(formData.testDate),
          results: results.map(result => ({
            ...result,
            value: parseFloat(result.value),
            referenceRange: {
              min: parseFloat(result.referenceRange.min),
              max: parseFloat(result.referenceRange.max),
            },
          })),
        }),
      });

      if (response.ok) {
        router.push('/dashboard/blood-work');
      } else {
        console.error('Failed to save blood work results');
      }
    } catch (error) {
      console.error('Error saving blood work results:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Blood Work Results</h1>
          <p className="text-gray-600">Record your latest lab test results</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span>Test Information</span>
            </CardTitle>
            <CardDescription>
              Enter the basic information about your blood work test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testName">Test Name</Label>
                <Input
                  id="testName"
                  placeholder="Complete Blood Count (CBC)"
                  value={formData.testName}
                  onChange={(e) => handleInputChange('testName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testDate">Test Date</Label>
                <Input
                  id="testDate"
                  type="date"
                  value={formData.testDate}
                  onChange={(e) => handleInputChange('testDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labName">Laboratory</Label>
                <Input
                  id="labName"
                  placeholder="LabCorp, Quest Diagnostics, etc."
                  value={formData.labName}
                  onChange={(e) => handleInputChange('labName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorName">Ordering Doctor</Label>
                <Input
                  id="doctorName"
                  placeholder="Dr. Smith"
                  value={formData.doctorName}
                  onChange={(e) => handleInputChange('doctorName', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Test Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Metabolic Panel</SelectItem>
                  <SelectItem value="complete">Complete Blood Count</SelectItem>
                  <SelectItem value="specialized">Specialized Tests</SelectItem>
                  <SelectItem value="hormonal">Hormonal Tests</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this test..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Enter each test parameter and its results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Result {index + 1}</h4>
                  {results.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResult(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Parameter</Label>
                    <Input
                      placeholder="Hemoglobin"
                      value={result.parameter}
                      onChange={(e) => handleResultChange(index, 'parameter', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="14.2"
                      value={result.value}
                      onChange={(e) => handleResultChange(index, 'value', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      placeholder="g/dL"
                      value={result.unit}
                      onChange={(e) => handleResultChange(index, 'unit', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={result.status} 
                      onValueChange={(value) => handleResultChange(index, 'status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reference Range (Min)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="12.0"
                      value={result.referenceRange.min}
                      onChange={(e) => handleReferenceRangeChange(index, 'min', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reference Range (Max)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="16.0"
                      value={result.referenceRange.max}
                      onChange={(e) => handleReferenceRangeChange(index, 'max', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addResult}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Result
            </Button>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Results
          </Button>
        </div>
      </form>
    </div>
  );
} 