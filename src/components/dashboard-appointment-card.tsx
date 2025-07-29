"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Stethoscope, Calendar, Eye } from "lucide-react";
import AppointmentDetailsModal from "./appointment-details-modal";

interface DoctorVisit {
  _id: string;
  doctorName: string;
  specialty: string;
  visitDate: string;
  visitTime?: string;
  visitType: string;
  status: string;
  notes?: string;
  location?: string;
}

interface DashboardAppointmentCardProps {
  visit: DoctorVisit;
}

export default function DashboardAppointmentCard({ visit }: DashboardAppointmentCardProps) {
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

  return (
    <>
      <div 
        className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-3 cursor-pointer hover:bg-blue-100 transition-colors"
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {visit.visitType} - {visit.specialty}
              </span>
            </div>
            <div className="text-xs text-blue-700">
              <div className="font-medium">{visit.doctorName}</div>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(visit.visitDate).toLocaleDateString()}</span>
                {visit.visitTime && (
                  <>
                    <span>•</span>
                    <span>{visit.visitTime}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        appointmentId={visit._id}
      />
    </>
  );
} 