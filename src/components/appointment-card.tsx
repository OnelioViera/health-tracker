"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Plus, TrendingUp, AlertTriangle, Calendar, Clock, DollarSign, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import DoctorVisitActions from "@/components/doctor-visit-actions";
import AppointmentDetailsModal from "@/components/appointment-details-modal";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface DoctorVisitData {
  _id: string;
  doctorName: string;
  specialty: string;
  visitDate: Date;
  visitTime?: string;
  visitType: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  medications: Medication[];
  recommendations: string[];
  followUpDate?: Date;
  notes: string;
  cost?: number;
  insurance?: string;
  location?: string;
  status: string;
}

interface AppointmentCardProps {
  visit: DoctorVisitData;
  isUpcoming?: boolean;
  onStatusUpdate?: () => void; // Add callback for status updates
}

export default function AppointmentCard({ visit, isUpcoming = false, onStatusUpdate }: AppointmentCardProps) {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleViewDetails = () => {
    setIsDetailsModalOpen(true);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsDetailsModalOpen(true);
  };

  // Check if appointment is past due
  const isPastDue = () => {
    const visitDate = new Date(visit.visitDate);
    const now = new Date();
    return visit.status === 'scheduled' && visitDate < now;
  };

  return (
    <>
      <div 
        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
          isUpcoming 
            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isUpcoming 
              ? 'bg-blue-100' 
              : 'bg-green-100'
          }`}>
            {isUpcoming ? (
              <Calendar className="h-6 w-6 text-blue-600" />
            ) : (
              <Clock className="h-6 w-6 text-green-600" />
            )}
          </div>
          <div>
            <p className="text-lg font-semibold">{visit.visitType} - {visit.doctorName}</p>
            <p className="text-sm text-gray-500">{visit.specialty}</p>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(visit.visitDate).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {visit.visitTime || '9:00 AM'}
              </span>
              {visit.location && (
                <span className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {visit.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isPastDue() && (
            <Badge variant="destructive" className="text-xs">
              Past Due
            </Badge>
          )}
          <Badge 
            variant="outline" 
            className={isUpcoming ? 'text-blue-600' : 'text-green-600'}
          >
            {visit.status}
          </Badge>
          <DoctorVisitActions visitId={visit._id} onStatusUpdate={onStatusUpdate} />
        </div>
      </div>

      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        appointmentId={visit._id}
        onStatusUpdate={onStatusUpdate}
      />
    </>
  );
} 