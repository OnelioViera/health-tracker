"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Stethoscope, 
  User, 
  DollarSign, 
  FileText,
  Pill,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import { toast } from "sonner";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface AppointmentDetails {
  _id: string;
  doctorName: string;
  specialty: string;
  visitDate: string;
  visitTime?: string;
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

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string | null;
  onStatusUpdate?: () => void; // Add callback for status updates
}

export default function AppointmentDetailsModal({ 
  isOpen, 
  onClose, 
  appointmentId,
  onStatusUpdate
}: AppointmentDetailsModalProps) {
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [isOpen, appointmentId]);

  const fetchAppointmentDetails = async () => {
    if (!appointmentId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/doctor-visits/${appointmentId}`);
      if (response.ok) {
        const data = await response.json();
        setAppointment(data);
      } else {
        console.error('Failed to fetch appointment details');
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      case 'rescheduled':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!appointmentId) return;
    
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/doctor-visits/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...appointment,
          status: 'completed',
        }),
      });

      if (response.ok) {
        toast.success('Appointment marked as completed');
        // Update the local state
        setAppointment(prev => prev ? { ...prev, status: 'completed' } : null);
        // Notify parent component to refresh
        onStatusUpdate?.();
      } else {
        console.error('Failed to update appointment status');
        toast.error('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Error updating appointment status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Check if appointment is past due
  const isPastDue = () => {
    if (!appointment) return false;
    const visitDate = new Date(appointment.visitDate);
    const now = new Date();
    return appointment.status === 'scheduled' && visitDate < now;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            <span>Appointment Details</span>
            {isPastDue() && (
              <Badge variant="destructive" className="ml-2">
                Past Due
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Detailed information about your medical appointment
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : appointment ? (
          <div className="space-y-6">
            {/* Header Information */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {appointment.visitType} - {appointment.doctorName}
                </h3>
                <p className="text-gray-600">{appointment.specialty}</p>
                {isPastDue() && (
                  <p className="text-sm text-red-600 mt-1">
                    ⚠️ This appointment was scheduled for {new Date(appointment.visitDate).toLocaleDateString()} but hasn&apos;t been marked as completed yet.
                  </p>
                )}
              </div>
              <Badge className={`${getStatusColor(appointment.status)} flex items-center space-x-1`}>
                {getStatusIcon(appointment.status)}
                <span className="capitalize">{appointment.status}</span>
              </Badge>
            </div>

            {/* Date and Time */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {new Date(appointment.visitDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {appointment.visitTime && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{appointment.visitTime}</span>
                  </div>
                )}
                {appointment.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{appointment.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Information */}
            {(appointment.symptoms.length > 0 || appointment.diagnosis || appointment.treatment) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appointment.symptoms.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Symptoms</h4>
                      <div className="flex flex-wrap gap-2">
                        {appointment.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {appointment.diagnosis && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Diagnosis</h4>
                      <p className="text-sm text-gray-600">{appointment.diagnosis}</p>
                    </div>
                  )}
                  
                  {appointment.treatment && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Treatment</h4>
                      <p className="text-sm text-gray-600">{appointment.treatment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Medications */}
            {appointment.medications.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <Pill className="h-4 w-4" />
                    <span>Medications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appointment.medications.map((medication, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">{medication.name}</h5>
                          <Badge variant="outline" className="text-xs">
                            {medication.dosage}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p><span className="font-medium">Frequency:</span> {medication.frequency}</p>
                          <p><span className="font-medium">Duration:</span> {medication.duration}</p>
                          {medication.notes && (
                            <p><span className="font-medium">Notes:</span> {medication.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {appointment.recommendations.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {appointment.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Financial Information */}
            {(appointment.cost || appointment.insurance) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Financial Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {appointment.cost && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cost</span>
                      <span className="font-medium">${appointment.cost.toLocaleString()}</span>
                    </div>
                  )}
                  {appointment.insurance && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Insurance</span>
                      <span className="text-sm font-medium">{appointment.insurance}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Follow-up Information */}
            {appointment.followUpDate && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">Follow-up</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {new Date(appointment.followUpDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {appointment.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{appointment.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Failed to load appointment details</p>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          {(appointment?.status === 'scheduled' || isPastDue()) && (
            <Button 
              onClick={handleMarkAsCompleted}
              disabled={isUpdatingStatus}
              className={isPastDue() ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {isUpdatingStatus ? 'Updating...' : isPastDue() ? 'Mark as Completed (Past Due)' : 'Mark as Completed'}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 