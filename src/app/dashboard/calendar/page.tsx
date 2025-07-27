"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle,
  CheckCircle,
  Activity,
  TrendingUp,
  Heart,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import BackButton from "@/components/back-button";

// Mock calendar data for initial state
const initialEvents = [
  {
    _id: "1",
    title: "Annual Physical",
    type: "appointment" as const,
    date: "2024-01-15",
    time: "10:00 AM",
    doctor: "Dr. Sarah Johnson",
    location: "Medical Center",
    status: "upcoming" as const,
    color: "blue",
    notes: "Annual checkup with blood work",
    category: "appointment",
    isCompleted: false
  },
  {
    _id: "2",
    title: "Blood Pressure Check",
    type: "reminder" as const,
    date: "2024-01-12",
    time: "9:00 AM",
    status: "completed" as const,
    color: "green",
    notes: "Weekly blood pressure monitoring",
    category: "reminder",
    isCompleted: true
  },
  {
    _id: "3",
    title: "Blood Work Results",
    type: "test" as const,
    date: "2024-01-10",
    time: "2:00 PM",
    status: "completed" as const,
    color: "purple",
    notes: "Complete blood count results review",
    category: "test",
    isCompleted: true
  },
  {
    _id: "4",
    title: "Weight Check",
    type: "reminder" as const,
    date: "2024-01-08",
    time: "8:00 AM",
    status: "completed" as const,
    color: "orange",
    notes: "Monthly weight tracking",
    category: "reminder",
    isCompleted: true
  },
  {
    _id: "5",
    title: "Dental Cleaning",
    type: "appointment" as const,
    date: "2024-01-20",
    time: "3:30 PM",
    doctor: "Dr. Michael Chen",
    location: "Dental Clinic",
    status: "upcoming" as const,
    color: "blue",
    notes: "Regular dental cleaning and checkup",
    category: "appointment",
    isCompleted: false
  },
  {
    _id: "6",
    title: "Medication Refill",
    type: "reminder" as const,
    date: "2024-01-18",
    time: "11:00 AM",
    status: "upcoming" as const,
    color: "red",
    notes: "Prescription refill reminder",
    category: "reminder",
    isCompleted: false
  }
];

const eventTypes = [
  { name: "All Events", value: "all" },
  { name: "Appointments", value: "appointment" },
  { name: "Reminders", value: "reminder" },
  { name: "Tests", value: "test" },
];

interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: 'appointment' | 'reminder' | 'test' | 'medication' | 'other';
  category: string;
  isCompleted: boolean;
  notes?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  color: string;
  doctor?: string;
  location?: string;
}

interface EventData {
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: 'appointment' | 'reminder' | 'test' | 'medication' | 'other';
  category: string;
  notes?: string;
}

export default function CalendarPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch events from MongoDB
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/calendar-events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error('Failed to fetch events');
        // Fallback to initial events if API fails
        setEvents(initialEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to initial events if API fails
      setEvents(initialEvents);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new event
  const createEvent = async (eventData: EventData) => {
    try {
      const response = await fetch('/api/calendar-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prev => [...prev, newEvent]);
        toast.success('Event created successfully');
        return newEvent;
      } else {
        throw new Error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      throw error;
    }
  };

  // Update event
  const updateEvent = async (eventId: string, eventData: EventData) => {
    try {
      const response = await fetch(`/api/calendar-events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(prev => prev.map(event => 
          event._id === eventId ? updatedEvent : event
        ));
        toast.success('Event updated successfully');
        return updatedEvent;
      } else {
        throw new Error('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      throw error;
    }
  };

  // Delete event
  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar-events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEvents(prev => prev.filter(event => event._id !== eventId));
        toast.success('Event deleted successfully');
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => 
    selectedFilter === "all" || event.type === selectedFilter
  );

  const upcomingEvents = filteredEvents.filter(event => event.status === "upcoming");
  const completedEvents = filteredEvents.filter(event => event.status === "completed");

  // Calculate dynamic event counts
  const eventCounts = {
    all: events.length,
    appointment: events.filter(event => event.type === "appointment").length,
    reminder: events.filter(event => event.type === "reminder").length,
    test: events.filter(event => event.type === "test").length,
  };

  const eventTypesWithCounts = eventTypes.map(type => ({
    ...type,
    count: eventCounts[type.value as keyof typeof eventCounts] || 0
  }));

  const handleDayClick = (day: number) => {
    const dayEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      const selectedYear = selectedDate.getFullYear();
      const selectedMonth = selectedDate.getMonth();
      return eventDate.getDate() === day && 
             eventDate.getMonth() === selectedMonth && 
             eventDate.getFullYear() === selectedYear;
    });
    if (dayEvents.length > 0) {
      setSelectedEvent(dayEvents[0]);
      setIsEventModalOpen(true);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent({ ...event });
    setIsEditMode(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      setIsEditMode(false);
      setEditingEvent(null);
    } catch (error) {
      // Error is already handled in deleteEvent function
    }
  };

  const handleSaveEvent = async () => {
    try {
      if (editingEvent?._id) {
        // Update existing event
        const eventData: EventData = {
          title: editingEvent.title,
          description: editingEvent.description,
          date: editingEvent.date,
          time: editingEvent.time,
          type: editingEvent.type,
          category: editingEvent.category,
          notes: editingEvent.notes
        };
        await updateEvent(editingEvent._id, eventData);
      } else if (editingEvent) {
        // Create new event
        const eventData: EventData = {
          title: editingEvent.title,
          description: editingEvent.description,
          date: editingEvent.date,
          time: editingEvent.time,
          type: editingEvent.type,
          category: editingEvent.category,
          notes: editingEvent.notes
        };
        await createEvent(eventData);
      }
      
      setIsEditMode(false);
      setEditingEvent(null);
    } catch (error) {
      // Error is already handled in updateEvent/createEvent functions
    }
  };

  const getEventsForDay = (day: number) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      const selectedYear = selectedDate.getFullYear();
      const selectedMonth = selectedDate.getMonth();
      return eventDate.getDate() === day && 
             eventDate.getMonth() === selectedMonth && 
             eventDate.getFullYear() === selectedYear;
    });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200 bg-gray-50" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === selectedDate.getMonth() &&
                     new Date().getFullYear() === selectedDate.getFullYear();
      
      days.push(
        <div
          key={day}
          className={`p-2 border border-gray-200 min-h-[80px] cursor-pointer transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
          } ${dayEvents.length > 0 ? 'bg-yellow-50' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1 mt-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event._id}
                className={`text-xs p-1 rounded cursor-pointer ${
                  event.color === "blue" ? "bg-blue-100 text-blue-800" :
                  event.color === "green" ? "bg-green-100 text-green-800" :
                  event.color === "purple" ? "bg-purple-100 text-purple-800" :
                  event.color === "orange" ? "bg-orange-100 text-orange-800" :
                  "bg-red-100 text-red-800"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event);
                }}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600">Manage your health appointments and reminders</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading calendar...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Health Calendar</h1>
            <p className="text-gray-600">Track your health appointments and events</p>
          </div>
        </div>
        <Button onClick={() => {
          setEditingEvent(null);
          setIsEditMode(false);
          setIsEventModalOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <h3 className="text-sm font-medium text-gray-700">Filter by:</h3>
        {eventTypesWithCounts.map((type) => (
          <Button
            key={type.value}
            variant={selectedFilter === type.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(type.value)}
          >
            {type.name}
            <Badge variant="secondary" className="ml-2">
              {type.count}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{getMonthName(selectedDate)}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Click on a day to view events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {/* Calendar Header */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {renderCalendarDays()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Upcoming Events</span>
              </CardTitle>
              <CardDescription>
                Your next health appointments and reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div 
                    key={event._id} 
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      event.color === "blue" ? "bg-blue-500" :
                      event.color === "green" ? "bg-green-500" :
                      event.color === "purple" ? "bg-purple-500" :
                      event.color === "orange" ? "bg-orange-500" :
                      "bg-red-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </p>
                      {event.doctor && (
                        <p className="text-xs text-gray-500">
                          {event.doctor}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Recent Events</span>
              </CardTitle>
              <CardDescription>
                Recently completed health activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {completedEvents.slice(0, 3).map((event) => (
                <div 
                  key={event._id} 
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    event.color === "blue" ? "bg-blue-500" :
                    event.color === "green" ? "bg-green-500" :
                    event.color === "purple" ? "bg-purple-500" :
                    event.color === "orange" ? "bg-orange-500" :
                    "bg-red-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Completed
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{isEditMode ? 'Edit Event' : 'Event Details'}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && !isEditMode && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600">{selectedEvent.type}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}
                  </span>
                </div>
                
                {selectedEvent.doctor && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedEvent.doctor}</span>
                  </div>
                )}
                
                {selectedEvent.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedEvent.location}</span>
                  </div>
                )}
                
                {selectedEvent.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{selectedEvent.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <Badge 
                  variant={selectedEvent.status === "upcoming" ? "default" : "secondary"}
                >
                  {selectedEvent.status}
                </Badge>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEvent(selectedEvent)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEvent(selectedEvent._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {isEditMode && editingEvent && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={editingEvent.date}
                      onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={editingEvent.time}
                      onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <Select
                    value={editingEvent.type}
                    onValueChange={(value) => setEditingEvent({ ...editingEvent, type: value as CalendarEvent['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="test">Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {editingEvent.doctor && (
                  <div>
                    <Label htmlFor="doctor">Doctor</Label>
                    <Input
                      id="doctor"
                      value={editingEvent.doctor}
                      onChange={(e) => setEditingEvent({ ...editingEvent, doctor: e.target.value })}
                    />
                  </div>
                )}
                
                {editingEvent.location && (
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editingEvent.location}
                      onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editingEvent.notes}
                    onChange={(e) => setEditingEvent({ ...editingEvent, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4 border-t">
                <Button onClick={handleSaveEvent} className="flex-1">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditMode(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-blue-500" />
              <span>Add Appointment</span>
            </CardTitle>
            <CardDescription>
              Schedule a new doctor appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/doctor-visits/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Appointment
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Set Reminder</span>
            </CardTitle>
            <CardDescription>
              Create a health reminder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Set Reminder
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <span>Export Calendar</span>
            </CardTitle>
            <CardDescription>
              Download your health calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 