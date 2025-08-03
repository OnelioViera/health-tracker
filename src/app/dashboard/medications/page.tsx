"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pill, Calendar, User, Building, RefreshCw, Download, FileText, Save } from "lucide-react";
import BackButton from "@/components/back-button";

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay?: string;
  duration: string;
  startDate: string;
  endDate?: string;
  status: string;
  category: string;
  prescribedBy?: string;
  pharmacy?: string;
  notes?: string;
  sideEffects?: string[];
  interactions?: string[];
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [pdfOptions, setPdfOptions] = useState({
    patientName: "",
    patientInfo: {
      dateOfBirth: "",
      address: "",
      phone: "",
      email: ""
    },
    doctorInfo: {
      name: "",
      license: "",
      specialty: "",
      phone: "",
      address: ""
    },
    pharmacyInfo: {
      name: "",
      address: "",
      phone: ""
    },
    includeActiveOnly: true,
    includeNotes: true,
    includeSideEffects: true,
    includeInteractions: true
  });
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    timeOfDay: "",
    startDate: "",
    status: "active",
    category: "prescription",
    prescribedBy: "",
    pharmacy: "",
    notes: "",
    sideEffects: [] as string[],
    interactions: [] as string[]
  });

  useEffect(() => {
    fetchMedications();
    loadPdfPreferences();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/medications');
      if (response.ok) {
        const data = await response.json();
        setMedications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
      toast.error('Failed to load medications');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPdfPreferences = async () => {
    try {
      const response = await fetch('/api/pdf-preferences');
      if (response.ok) {
        const preferences = await response.json();
        setPdfOptions(preferences);
      }
    } catch (error) {
      console.error('Error loading PDF preferences:', error);
    }
  };

  const savePdfPreferences = async () => {
    setIsSavingPreferences(true);
    try {
      const response = await fetch('/api/pdf-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfOptions),
      });

      if (response.ok) {
        toast.success('PDF preferences saved as default');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving PDF preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleAddMedication = async () => {
    try {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMedication),
      });

      if (response.ok) {
        toast.success('Medication added successfully');
        setShowAddForm(false);
        setNewMedication({
          name: "",
          dosage: "",
          frequency: "",
          timeOfDay: "",
          startDate: "",
          status: "active",
          category: "prescription",
          prescribedBy: "",
          pharmacy: "",
          notes: "",
          sideEffects: [],
          interactions: []
        });
        fetchMedications();
      } else {
        toast.error('Failed to add medication');
      }
    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error('Failed to add medication');
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      const response = await fetch(`/api/medications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Medication deleted successfully');
        fetchMedications();
      } else {
        toast.error('Failed to delete medication');
      }
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast.error('Failed to delete medication');
    }
  };

  const handleEditMedication = async () => {
    if (!editingMedication) return;
    
    try {
      const response = await fetch(`/api/medications/${editingMedication._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingMedication),
      });

      if (response.ok) {
        toast.success('Medication updated successfully');
        setEditingMedication(null);
        fetchMedications();
      } else {
        toast.error('Failed to update medication');
      }
    } catch (error) {
      console.error('Error updating medication:', error);
      toast.error('Failed to update medication');
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfOptions.patientName.trim()) {
      toast.error('Patient name is required');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const response = await fetch('/api/prescriptions/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfOptions),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prescriptions_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Prescription PDF downloaded successfully');
        setShowPdfModal(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const startEditing = (medication: Medication) => {
    setEditingMedication(medication);
    setShowAddForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading medications...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
            <p className="text-gray-600">Manage your medications and prescriptions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Download Prescription PDF</DialogTitle>
                <DialogDescription>
                  Configure the options for your prescription PDF download.
                </DialogDescription>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    💡 Your saved preferences will be automatically loaded. Use &quot;Save as Default&quot; to remember your settings for future downloads.
                  </p>
                </div>
              </DialogHeader>
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientName">Patient Name *</Label>
                      <Input
                        id="patientName"
                        value={pdfOptions.patientName}
                        onChange={(e) => setPdfOptions({ ...pdfOptions, patientName: e.target.value })}
                        placeholder="Enter patient name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={pdfOptions.patientInfo.dateOfBirth}
                        onChange={(e) => setPdfOptions({
                          ...pdfOptions,
                          patientInfo: { ...pdfOptions.patientInfo, dateOfBirth: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientPhone">Phone</Label>
                      <Input
                        id="patientPhone"
                        value={pdfOptions.patientInfo.phone}
                        onChange={(e) => setPdfOptions({
                          ...pdfOptions,
                          patientInfo: { ...pdfOptions.patientInfo, phone: e.target.value }
                        })}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientEmail">Email</Label>
                      <Input
                        id="patientEmail"
                        type="email"
                        value={pdfOptions.patientInfo.email}
                        onChange={(e) => setPdfOptions({
                          ...pdfOptions,
                          patientInfo: { ...pdfOptions.patientInfo, email: e.target.value }
                        })}
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="patientAddress">Address</Label>
                    <Textarea
                      id="patientAddress"
                      value={pdfOptions.patientInfo.address}
                      onChange={(e) => setPdfOptions({
                        ...pdfOptions,
                        patientInfo: { ...pdfOptions.patientInfo, address: e.target.value }
                      })}
                      placeholder="Full address"
                    />
                  </div>
                </div>

                {/* Doctor Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Doctor Information (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="doctorName">Doctor Name</Label>
                      <Input
                        id="doctorName"
                        value={pdfOptions.doctorInfo.name}
                        onChange={(e) => setPdfOptions({
                          ...pdfOptions,
                          doctorInfo: { ...pdfOptions.doctorInfo, name: e.target.value }
                        })}
                        placeholder="Dr. Smith"
                      />
                    </div>
                    <div>
                      <Label htmlFor="doctorLicense">License Number</Label>
                      <Input
                        id="doctorLicense"
                        value={pdfOptions.doctorInfo.license}
                        onChange={(e) => setPdfOptions({
                          ...pdfOptions,
                          doctorInfo: { ...pdfOptions.doctorInfo, license: e.target.value }
                        })}
                        placeholder="License number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="doctorSpecialty">Specialty</Label>
                      <Input
                        id="doctorSpecialty"
                        value={pdfOptions.doctorInfo.specialty}
                        onChange={(e) => setPdfOptions({
                          ...pdfOptions,
                          doctorInfo: { ...pdfOptions.doctorInfo, specialty: e.target.value }
                        })}
                        placeholder="Cardiology"
                      />
                    </div>
                    <div>
                      <Label htmlFor="doctorPhone">Phone</Label>
                      <Input
                        id="doctorPhone"
                        value={pdfOptions.doctorInfo.phone}
                        onChange={(e) => setPdfOptions({
                          ...pdfOptions,
                          doctorInfo: { ...pdfOptions.doctorInfo, phone: e.target.value }
                        })}
                        placeholder="Doctor's phone"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="doctorAddress">Doctor Address</Label>
                    <Textarea
                      id="doctorAddress"
                      value={pdfOptions.doctorInfo.address}
                      onChange={(e) => setPdfOptions({
                        ...pdfOptions,
                        doctorInfo: { ...pdfOptions.doctorInfo, address: e.target.value }
                      })}
                      placeholder="Doctor's address"
                    />
                  </div>
                </div>

                {/* Pharmacy Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pharmacy Information (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                      <Input
                        id="pharmacyName"
                        value={pdfOptions.pharmacyInfo.name}
                        onChange={(e) => setPdfOptions({
                          ...pdfOptions,
                          pharmacyInfo: { ...pdfOptions.pharmacyInfo, name: e.target.value }
                        })}
                        placeholder="CVS Pharmacy"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pharmacyPhone">Phone</Label>
                      <Input
                        id="pharmacyPhone"
                        value={pdfOptions.pharmacyInfo.phone}
                        onChange={(e) => setPdfOptions({
                          ...pdfOptions,
                          pharmacyInfo: { ...pdfOptions.pharmacyInfo, phone: e.target.value }
                        })}
                        placeholder="Pharmacy phone"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pharmacyAddress">Pharmacy Address</Label>
                    <Textarea
                      id="pharmacyAddress"
                      value={pdfOptions.pharmacyInfo.address}
                      onChange={(e) => setPdfOptions({
                        ...pdfOptions,
                        pharmacyInfo: { ...pdfOptions.pharmacyInfo, address: e.target.value }
                      })}
                      placeholder="Pharmacy address"
                    />
                  </div>
                </div>

                {/* PDF Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">PDF Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeActiveOnly"
                        checked={pdfOptions.includeActiveOnly}
                        onCheckedChange={(checked) => setPdfOptions({
                          ...pdfOptions,
                          includeActiveOnly: checked as boolean
                        })}
                      />
                      <Label htmlFor="includeActiveOnly">Include active prescriptions only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeNotes"
                        checked={pdfOptions.includeNotes}
                        onCheckedChange={(checked) => setPdfOptions({
                          ...pdfOptions,
                          includeNotes: checked as boolean
                        })}
                      />
                      <Label htmlFor="includeNotes">Include medication notes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeSideEffects"
                        checked={pdfOptions.includeSideEffects}
                        onCheckedChange={(checked) => setPdfOptions({
                          ...pdfOptions,
                          includeSideEffects: checked as boolean
                        })}
                      />
                      <Label htmlFor="includeSideEffects">Include side effects</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeInteractions"
                        checked={pdfOptions.includeInteractions}
                        onCheckedChange={(checked) => setPdfOptions({
                          ...pdfOptions,
                          includeInteractions: checked as boolean
                        })}
                      />
                      <Label htmlFor="includeInteractions">Include drug interactions</Label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 pt-4">
                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleDownloadPdf} 
                      disabled={isGeneratingPdf || !pdfOptions.patientName.trim()}
                      className="flex-1"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPdfModal(false)}
                      disabled={isGeneratingPdf}
                    >
                      Cancel
                    </Button>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={savePdfPreferences}
                    disabled={isSavingPreferences || !pdfOptions.patientName.trim()}
                    className="w-full"
                  >
                    {isSavingPreferences ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save as Default
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchMedications();
              toast.success('Medications data refreshed');
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </div>

      {/* Add Medication Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Medication</CardTitle>
            <CardDescription>Enter your medication details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Medication Name</Label>
                <Input
                  id="name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  placeholder="e.g., Lisinopril"
                />
              </div>
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  placeholder="e.g., 10mg"
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={newMedication.frequency} onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once daily">Once daily</SelectItem>
                    <SelectItem value="twice daily">Twice daily</SelectItem>
                    <SelectItem value="three times daily">Three times daily</SelectItem>
                    <SelectItem value="as needed">As needed</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timeOfDay">Time of Day</Label>
                <Select value={newMedication.timeOfDay} onValueChange={(value) => setNewMedication({ ...newMedication, timeOfDay: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time of day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newMedication.startDate}
                  onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newMedication.status} onValueChange={(value) => setNewMedication({ ...newMedication, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newMedication.category} onValueChange={(value) => setNewMedication({ ...newMedication, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="over-the-counter">Over-the-counter</SelectItem>
                    <SelectItem value="supplement">Supplement</SelectItem>
                    <SelectItem value="vitamin">Vitamin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="prescribedBy">Prescribed By</Label>
                <Input
                  id="prescribedBy"
                  value={newMedication.prescribedBy}
                  onChange={(e) => setNewMedication({ ...newMedication, prescribedBy: e.target.value })}
                  placeholder="e.g., Dr. Smith"
                />
              </div>
              <div>
                <Label htmlFor="pharmacy">Pharmacy</Label>
                <Input
                  id="pharmacy"
                  value={newMedication.pharmacy}
                  onChange={(e) => setNewMedication({ ...newMedication, pharmacy: e.target.value })}
                  placeholder="e.g., CVS Pharmacy"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newMedication.notes}
                onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
                placeholder="Additional notes about the medication..."
              />
            </div>
            <div className="flex space-x-4">
              <Button onClick={handleAddMedication} disabled={!newMedication.name || !newMedication.dosage}>
                Add Medication
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Medication Form */}
      {editingMedication && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Medication</CardTitle>
            <CardDescription>Update your medication details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Medication Name</Label>
                <Input
                  id="edit-name"
                  value={editingMedication.name}
                  onChange={(e) => setEditingMedication({ ...editingMedication, name: e.target.value })}
                  placeholder="e.g., Lisinopril"
                />
              </div>
              <div>
                <Label htmlFor="edit-dosage">Dosage</Label>
                <Input
                  id="edit-dosage"
                  value={editingMedication.dosage}
                  onChange={(e) => setEditingMedication({ ...editingMedication, dosage: e.target.value })}
                  placeholder="e.g., 10mg"
                />
              </div>
              <div>
                <Label htmlFor="edit-frequency">Frequency</Label>
                <Select value={editingMedication.frequency} onValueChange={(value) => setEditingMedication({ ...editingMedication, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once daily">Once daily</SelectItem>
                    <SelectItem value="twice daily">Twice daily</SelectItem>
                    <SelectItem value="three times daily">Three times daily</SelectItem>
                    <SelectItem value="as needed">As needed</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-timeOfDay">Time of Day</Label>
                <Select value={editingMedication.timeOfDay || ""} onValueChange={(value) => setEditingMedication({ ...editingMedication, timeOfDay: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time of day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editingMedication.startDate.split('T')[0]}
                  onChange={(e) => setEditingMedication({ ...editingMedication, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editingMedication.status} onValueChange={(value) => setEditingMedication({ ...editingMedication, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={editingMedication.category} onValueChange={(value) => setEditingMedication({ ...editingMedication, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="over-the-counter">Over-the-counter</SelectItem>
                    <SelectItem value="supplement">Supplement</SelectItem>
                    <SelectItem value="vitamin">Vitamin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-prescribedBy">Prescribed By</Label>
                <Input
                  id="edit-prescribedBy"
                  value={editingMedication.prescribedBy || ""}
                  onChange={(e) => setEditingMedication({ ...editingMedication, prescribedBy: e.target.value })}
                  placeholder="e.g., Dr. Smith"
                />
              </div>
              <div>
                <Label htmlFor="edit-pharmacy">Pharmacy</Label>
                <Input
                  id="edit-pharmacy"
                  value={editingMedication.pharmacy || ""}
                  onChange={(e) => setEditingMedication({ ...editingMedication, pharmacy: e.target.value })}
                  placeholder="e.g., CVS Pharmacy"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editingMedication.notes || ""}
                onChange={(e) => setEditingMedication({ ...editingMedication, notes: e.target.value })}
                placeholder="Additional notes about the medication..."
              />
            </div>
            <div className="flex space-x-4">
              <Button onClick={handleEditMedication} disabled={!editingMedication.name || !editingMedication.dosage}>
                Update Medication
              </Button>
              <Button variant="outline" onClick={() => setEditingMedication(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medications.map((medication) => (
          <Card key={medication._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{medication.name}</CardTitle>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(medication.status)}`}>
                  {medication.status}
                </span>
              </div>
              <CardDescription>
                {medication.dosage} • {medication.frequency}
                {medication.timeOfDay && ` • ${medication.timeOfDay}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Started: {new Date(medication.startDate).toLocaleDateString()}</span>
              </div>
              {medication.prescribedBy && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Dr. {medication.prescribedBy}</span>
                </div>
              )}
              {medication.pharmacy && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>{medication.pharmacy}</span>
                </div>
              )}
              {medication.notes && (
                <p className="text-sm text-gray-600 mt-2">{medication.notes}</p>
              )}
              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => startEditing(medication)}>
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDeleteMedication(medication._id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {medications.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Pill className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medications yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Start tracking your medications to keep a complete health record.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Medication
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 