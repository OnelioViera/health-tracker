"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, ArrowLeft, Save, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

interface DoctorVisit {
  _id: string;
  doctorName: string;
  specialty: string;
  visitDate: string;
  visitTime: string;
  visitType: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  medications: Medication[];
  recommendations: string[];
  followUpDate?: string;
  notes: string;
  cost?: number;
  insurance?: string;
  location?: string;
  status: string;
}

export default function EditDoctorVisitPage() {
  const router = useRouter();
  const params = useParams();
  const visitId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
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
    doctorName: "",
    specialty: "",
    visitDate: "",
    visitTime: "",
    visitType: "",
    symptoms: [""],
    diagnosis: "",
    treatment: "",
    medications: [{
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      notes: "",
    }],
    recommendations: [""],
    followUpDate: "",
    notes: "",
    cost: "",
    insurance: "",
    location: "",
    status: "",
  });

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        const response = await fetch(`/api/doctor-visits/${visitId}`);
        if (response.ok) {
          const visit: DoctorVisit = await response.json();
          setFormData({
            doctorName: visit.doctorName,
            specialty: visit.specialty,
            visitDate: new Date(visit.visitDate).toISOString().split('T')[0],
            visitTime: convert24HourTo12Hour(visit.visitTime),
            visitType: visit.visitType,
            symptoms: visit.symptoms.length > 0 ? visit.symptoms : [""],
            diagnosis: visit.diagnosis,
            treatment: visit.treatment,
            medications: visit.medications.length > 0 ? visit.medications : [{
              name: "",
              dosage: "",
              frequency: "",
              duration: "",
              notes: "",
            }],
            recommendations: visit.recommendations.length > 0 ? visit.recommendations : [""],
            followUpDate: visit.followUpDate ? new Date(visit.followUpDate).toISOString().split('T')[0] : "",
            notes: visit.notes,
            cost: visit.cost?.toString() || "",
            insurance: visit.insurance || "",
            location: visit.location || "",
            status: visit.status,
          });
        } else {
          console.error('Failed to fetch doctor visit');
          toast.error('Failed to load doctor visit');
          router.push('/dashboard/doctor-visits');
        }
      } catch (error) {
        console.error('Error fetching doctor visit:', error);
        toast.error('Error loading doctor visit');
        router.push('/dashboard/doctor-visits');
      } finally {
        setIsLoading(false);
      }
    };

    if (visitId) {
      fetchVisit();
    }
  }, [visitId, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'symptoms' | 'recommendations', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'symptoms' | 'recommendations') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayItem = (field: 'symptoms' | 'recommendations', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    }
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const newMedications = [...formData.medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setFormData(prev => ({ ...prev, medications: newMedications }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        notes: "",
      }]
    }));
  };

  const removeMedication = (index: number) => {
    if (formData.medications.length > 1) {
      setFormData(prev => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/doctor-visits/${visitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          visitDate: new Date(`${formData.visitDate}T${convert12HourTo24Hour(formData.visitTime)}`),
          followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : undefined,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          symptoms: formData.symptoms.filter(s => s.trim() !== ""),
          recommendations: formData.recommendations.filter(r => r.trim() !== ""),
          medications: formData.medications.filter(m => m.name.trim() !== ""),
        }),
      });

      if (response.ok) {
        toast.success('Doctor visit updated successfully');
        router.push('/dashboard/doctor-visits');
      } else {
        console.error('Failed to update doctor visit');
        toast.error('Failed to update doctor visit');
      }
    } catch (error) {
      console.error('Error updating doctor visit:', error);
      toast.error('Error updating doctor visit');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading doctor visit...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Doctor Visit</h1>
          <p className="text-gray-600">Update your doctor visit information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-green-500" />
              <span>Visit Information</span>
            </CardTitle>
            <CardDescription>
              Update the basic information about your doctor visit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctorName">Doctor Name</Label>
                <Input
                  id="doctorName"
                  placeholder="Dr. Sarah Johnson"
                  value={formData.doctorName}
                  onChange={(e) => handleInputChange('doctorName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  placeholder="Primary Care, Cardiology, etc."
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitDate">Visit Date</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => handleInputChange('visitDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitTime">Visit Time</Label>
                <div className="flex space-x-2">
                  <Select 
                    value={formData.visitTime ? formData.visitTime.split(':')[0] : '12'}
                    onValueChange={(hour) => {
                      const currentTime = formData.visitTime || '12:00 AM';
                      const [_, minute, period] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['', '00', 'AM'];
                      handleInputChange('visitTime', `${hour}:${minute} ${period}`);
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
                    value={formData.visitTime ? formData.visitTime.split(':')[1]?.split(' ')[0] : '00'}
                    onValueChange={(minute) => {
                      const currentTime = formData.visitTime || '12:00 AM';
                      const [hour, _, period] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['12', '00', 'AM'];
                      handleInputChange('visitTime', `${hour}:${minute} ${period}`);
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
                    value={formData.visitTime ? formData.visitTime.split(' ')[1] : 'AM'}
                    onValueChange={(period) => {
                      const currentTime = formData.visitTime || '12:00 AM';
                      const [hour, minute] = currentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || ['12', '00'];
                      handleInputChange('visitTime', `${hour}:${minute} ${period}`);
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
              <div className="space-y-2">
                <Label htmlFor="visitType">Visit Type</Label>
                <Select value={formData.visitType} onValueChange={(value) => handleInputChange('visitType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkup">Checkup</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Medical Center, Hospital, etc."
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance</Label>
                <Input
                  id="insurance"
                  placeholder="Blue Cross Blue Shield"
                  value={formData.insurance}
                  onChange={(e) => handleInputChange('insurance', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle>Symptoms</CardTitle>
            <CardDescription>
              List any symptoms you experienced
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.symptoms.map((symptom, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder="e.g., Fever, Headache"
                  value={symptom}
                  onChange={(e) => handleArrayChange('symptoms', index, e.target.value)}
                />
                {formData.symptoms.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
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
              onClick={() => addArrayItem('symptoms')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Symptom
            </Button>
          </CardContent>
        </Card>

        {/* Diagnosis and Treatment */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnosis & Treatment</CardTitle>
            <CardDescription>
              Record the diagnosis and treatment plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                placeholder="Enter the diagnosis..."
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment</Label>
              <Textarea
                id="treatment"
                placeholder="Enter the treatment plan..."
                value={formData.treatment}
                onChange={(e) => handleInputChange('treatment', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader>
            <CardTitle>Medications</CardTitle>
            <CardDescription>
              List any medications prescribed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.medications.map((medication, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Medication {index + 1}</h4>
                  {formData.medications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Medication Name</Label>
                    <Input
                      placeholder="e.g., Acetaminophen"
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dosage</Label>
                    <Input
                      placeholder="e.g., 500mg"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Input
                      placeholder="e.g., Every 6 hours"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      placeholder="e.g., 7 days"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Any additional notes about this medication..."
                    value={medication.notes}
                    onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addMedication}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              List any recommendations from your doctor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder="e.g., Get plenty of rest"
                  value={recommendation}
                  onChange={(e) => handleArrayChange('recommendations', index, e.target.value)}
                />
                {formData.recommendations.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('recommendations', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('recommendations')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recommendation
            </Button>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>
              Any additional information about this visit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter any additional notes..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
            />
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
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Visit
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 