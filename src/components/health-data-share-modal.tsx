"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Scale, Stethoscope, Mail, Send, X } from "lucide-react";
import { toast } from "sonner";

interface HealthDataShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const dataTypes = [
  {
    id: 'bloodPressure',
    label: 'Blood Pressure',
    icon: Activity,
    description: 'Blood pressure readings and trends'
  },
  {
    id: 'bloodWork',
    label: 'Blood Work',
    icon: FileText,
    description: 'Lab results and test data'
  },
  {
    id: 'weight',
    label: 'Weight & BMI',
    icon: Scale,
    description: 'Weight tracking and BMI calculations'
  },
  {
    id: 'doctorVisits',
    label: 'Doctor Visits',
    icon: Stethoscope,
    description: 'Medical appointments and notes'
  }
];

export default function HealthDataShareModal({ open, onOpenChange }: HealthDataShareModalProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['bloodPressure', 'bloodWork']);
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    if (!recipientEmail || !recipientName) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedDataTypes.length === 0) {
      toast.error("Please select at least one data type to share");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/share-health-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail,
          recipientName,
          message,
          dataTypes: selectedDataTypes,
          expiresInDays: 30
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Health data shared successfully!");
        onOpenChange(false);
        // Reset form
        setRecipientEmail("");
        setRecipientName("");
        setMessage("");
        setSelectedDataTypes(['bloodPressure', 'bloodWork']);
      } else {
        toast.error(result.error || "Failed to share health data");
      }
    } catch (error) {
      console.error('Error sharing health data:', error);
      toast.error("Failed to share health data");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDataType = (dataType: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(dataType) 
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    );
  };

  const selectAll = () => {
    setSelectedDataTypes(dataTypes.map(type => type.id));
  };

  const clearAll = () => {
    setSelectedDataTypes([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-500" />
            <span>Share Health Data</span>
          </DialogTitle>
          <DialogDescription>
            Send your health data to trusted recipients via email. They&apos;ll receive a beautiful, modern email with your health information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipientName">Recipient Name *</Label>
              <Input
                id="recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Dr. Sarah Johnson"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="recipientEmail">Recipient Email *</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="doctor@example.com"
                className="mt-1"
              />
            </div>
          </div>

          {/* Personal Message */}
          <div>
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi Dr. Johnson, I wanted to share my recent health data with you for our upcoming appointment..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Data Type Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Select Data to Share</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                >
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dataTypes.map((dataType) => {
                const Icon = dataType.icon;
                const isSelected = selectedDataTypes.includes(dataType.id);
                
                return (
                  <Card 
                    key={dataType.id}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleDataType(dataType.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleDataType(dataType.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">{dataType.label}</span>
                            {isSelected && (
                              <Badge variant="secondary" className="text-xs">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {dataType.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Security Notice */}
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-amber-800">Security & Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-amber-700 space-y-2">
                <p>• Your health data will be sent via secure email</p>
                <p>• The recipient will receive a beautiful, modern email with your data</p>
                <p>• Data access expires in 30 days for security</p>
                <p>• Only share with trusted healthcare providers or family members</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={isLoading || selectedDataTypes.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Share Health Data
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 