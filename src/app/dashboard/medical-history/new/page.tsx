"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { History, ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import BackButton from "@/components/back-button";

export default function NewMedicalHistoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    condition: "",
    diagnosisDate: new Date().toISOString().split('T')[0],
    severity: "mild" as 'mild' | 'moderate' | 'severe',
    status: "active" as 'active' | 'resolved' | 'chronic',
    symptoms: [""],
    treatments: [""],
    medications: [""],
    doctorName: "",
    specialty: "",
    notes: "",
    followUpRequired: false,
    followUpDate: "",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'symptoms' | 'treatments' | 'medications', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'symptoms' | 'treatments' | 'medications') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayItem = (field: 'symptoms' | 'treatments' | 'medications', index: number) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, [field]: newArray }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/medical-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          diagnosisDate: new Date(formData.diagnosisDate),
          followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : undefined,
        }),
      });

      if (response.ok) {
        toast.success('Medical history entry created successfully');
        router.push('/dashboard/medical-history');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create medical history entry');
      }
    } catch (error) {
      console.error('Error creating medical history entry:', error);
      toast.error('An error occurred while creating the entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Medical History Entry</h1>
            <p className="text-gray-600">Record a new medical condition or health event</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
            <CardDescription>
              Enter the basic details about your medical condition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition Name *</Label>
                <Input
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  placeholder="e.g., Hypertension, Diabetes, Asthma"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosisDate">Diagnosis Date *</Label>
                <Input
                  id="diagnosisDate"
                  type="date"
                  value={formData.diagnosisDate}
                  onChange={(e) => handleInputChange('diagnosisDate', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="chronic">Chronic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Details</CardTitle>
            <CardDescription>
              Provide additional medical information and symptoms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Symptoms */}
            <div className="space-y-2">
              <Label>Symptoms</Label>
              {formData.symptoms.map((symptom, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={symptom}
                    onChange={(e) => handleArrayChange('symptoms', index, e.target.value)}
                    placeholder="e.g., Chest pain, Shortness of breath"
                  />
                  {formData.symptoms.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('symptoms', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('symptoms')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Symptom
              </Button>
            </div>

            {/* Treatments */}
            <div className="space-y-2">
              <Label>Treatments</Label>
              {formData.treatments.map((treatment, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={treatment}
                    onChange={(e) => handleArrayChange('treatments', index, e.target.value)}
                    placeholder="e.g., Medication, Surgery, Physical therapy"
                  />
                  {formData.treatments.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('treatments', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('treatments')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Treatment
              </Button>
            </div>

            {/* Medications */}
            <div className="space-y-2">
              <Label>Medications</Label>
              {formData.medications.map((medication, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={medication}
                    onChange={(e) => handleArrayChange('medications', index, e.target.value)}
                    placeholder="e.g., Lisinopril 10mg daily"
                  />
                  {formData.medications.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('medications', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('medications')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Information</CardTitle>
            <CardDescription>
              Information about the doctor who diagnosed or is treating this condition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctorName">Doctor Name</Label>
                <Input
                  id="doctorName"
                  value={formData.doctorName}
                  onChange={(e) => handleInputChange('doctorName', e.target.value)}
                  placeholder="e.g., Dr. Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  placeholder="e.g., Cardiology, Endocrinology"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-up and Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Follow-up and Notes</CardTitle>
            <CardDescription>
              Additional information and follow-up requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUpRequired"
                checked={formData.followUpRequired}
                onCheckedChange={(checked) => handleInputChange('followUpRequired', checked as boolean)}
              />
              <Label htmlFor="followUpRequired">Follow-up required</Label>
            </div>

            {formData.followUpRequired && (
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information about your condition, treatment plan, or special considerations..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/medical-history">
            <Button type="button" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Entry'}
          </Button>
        </div>
      </form>
    </div>
  );
} 