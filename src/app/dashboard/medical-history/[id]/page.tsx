"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { History, ArrowLeft, Save, Edit, Trash2, Plus, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import BackButton from "@/components/back-button";

interface MedicalHistoryEntry {
  _id: string;
  condition: string;
  diagnosisDate: Date;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'chronic';
  symptoms: string[];
  treatments: string[];
  medications: string[];
  doctorName?: string;
  specialty?: string;
  notes: string;
  followUpRequired: boolean;
  followUpDate?: Date;
}

export default function MedicalHistoryEntryPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;
  
  const [entry, setEntry] = useState<MedicalHistoryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    condition: "",
    diagnosisDate: "",
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

  useEffect(() => {
    if (entryId) {
      fetchEntry();
    }
  }, [entryId]);

  const fetchEntry = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/medical-history?id=${entryId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setEntry(data.data);
          setFormData({
            condition: data.data.condition,
            diagnosisDate: new Date(data.data.diagnosisDate).toISOString().split('T')[0],
            severity: data.data.severity,
            status: data.data.status,
            symptoms: data.data.symptoms.length > 0 ? data.data.symptoms : [""],
            treatments: data.data.treatments.length > 0 ? data.data.treatments : [""],
            medications: data.data.medications.length > 0 ? data.data.medications : [""],
            doctorName: data.data.doctorName || "",
            specialty: data.data.specialty || "",
            notes: data.data.notes || "",
            followUpRequired: data.data.followUpRequired || false,
            followUpDate: data.data.followUpDate ? new Date(data.data.followUpDate).toISOString().split('T')[0] : "",
          });
        } else {
          toast.error('Entry not found');
          router.push('/dashboard/medical-history');
        }
      } else {
        toast.error('Failed to fetch entry');
        router.push('/dashboard/medical-history');
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      toast.error('Failed to fetch entry');
      router.push('/dashboard/medical-history');
    } finally {
      setIsLoading(false);
    }
  };

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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: entryId,
          ...formData,
          diagnosisDate: new Date(formData.diagnosisDate),
          followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : undefined,
        }),
      });

      if (response.ok) {
        toast.success('Medical history entry updated successfully');
        setIsEditing(false);
        fetchEntry(); // Refresh the data
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update entry');
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('An error occurred while updating the entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/medical-history?id=${entryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Entry deleted successfully');
        router.push('/dashboard/medical-history');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('An error occurred while deleting the entry');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading entry...</div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Entry not found</p>
          <Link href="/dashboard/medical-history">
            <Button className="mt-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Medical History
            </Button>
          </Link>
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
            <h1 className="text-3xl font-bold text-gray-900">{entry.condition}</h1>
            <p className="text-gray-600">Medical History Entry Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!isEditing && (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition Name *</Label>
                  <Input
                    id="condition"
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Doctor Name</Label>
                  <Input
                    id="doctorName"
                    value={formData.doctorName}
                    onChange={(e) => handleInputChange('doctorName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Follow-up and Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Follow-up and Notes</CardTitle>
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
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      ) : (
        /* View Mode */
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Condition</Label>
                  <p className="text-lg font-semibold">{entry.condition}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Diagnosis Date</Label>
                  <p className="text-lg">{new Date(entry.diagnosisDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Severity</Label>
                  <Badge variant={entry.severity === 'severe' ? 'destructive' : entry.severity === 'moderate' ? 'secondary' : 'default'}>
                    {entry.severity}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Badge variant={entry.status === 'active' ? 'destructive' : entry.status === 'resolved' ? 'default' : 'secondary'}>
                    {entry.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entry.symptoms.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Symptoms</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {entry.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="outline">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {entry.treatments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Treatments</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {entry.treatments.map((treatment, index) => (
                      <Badge key={index} variant="outline">
                        {treatment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {entry.medications.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Medications</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {entry.medications.map((medication, index) => (
                      <Badge key={index} variant="outline">
                        {medication}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doctor Information */}
          {(entry.doctorName || entry.specialty) && (
            <Card>
              <CardHeader>
                <CardTitle>Doctor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entry.doctorName && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Doctor Name</Label>
                      <p className="text-lg">{entry.doctorName}</p>
                    </div>
                  )}
                  {entry.specialty && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Specialty</Label>
                      <p className="text-lg">{entry.specialty}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-up and Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Follow-up and Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox checked={entry.followUpRequired} disabled />
                <Label>Follow-up required</Label>
              </div>

              {entry.followUpRequired && entry.followUpDate && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Follow-up Date</Label>
                  <p className="text-lg">{new Date(entry.followUpDate).toLocaleDateString()}</p>
                </div>
              )}

              {entry.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Notes</Label>
                  <p className="text-lg mt-2">{entry.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 