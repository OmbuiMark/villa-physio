import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/hooks/useData';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Plus, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ReceptionistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { patients, appointments, physiotherapists, timeSlots, createAppointment, bookTimeSlot, addNotification } = useData();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedPhysiotherapist, setSelectedPhysiotherapist] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Generate next 30 days excluding Sundays
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays (0 = Sunday)
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          }),
          day: date.toLocaleDateString('en-US', { weekday: 'long' })
        });
      }
    }
    
    return dates;
  };

  const availableDates = generateAvailableDates();

  // Time slots based on day type
  const getTimeSlotsForDay = (dayName: string) => {
    const allSlots = [
      '7:00 AM - 8:30 AM',
      '9:00 AM - 10:30 AM',
      '10:30 AM - 12:00 PM',
      '12:00 PM - 1:30 PM',
      '2:00 PM - 3:30 PM',
      '3:30 PM - 5:00 PM'
    ];

    if (dayName === 'Saturday') {
      return allSlots.slice(0, 3); // Only 3 slots on Saturday
    }
    
    return allSlots; // 5 slots on weekdays
  };

  const isSlotBooked = (date: string, timeSlot: string) => {
    return appointments.some(app => 
      app.date === date && 
      app.timeSlot === timeSlot && 
      (app.status === 'approved' || app.status === 'pending')
    );
  };

  const bookAppointment = (date: string, timeSlot: string) => {
    if (!selectedPatient || !selectedPhysiotherapist) {
      toast({
        title: "Missing Information",
        description: "Please select both a patient and physiotherapist.",
        variant: "destructive",
      });
      return;
    }

    if (isSlotBooked(date, timeSlot)) {
      toast({
        title: "Slot Unavailable",
        description: "This time slot is already booked.",
        variant: "destructive",
      });
      return;
    }

    // Create appointment
    const newAppointment = createAppointment({
      patientId: selectedPatient,
      physiotherapistId: selectedPhysiotherapist,
      date,
      timeSlot,
      status: 'pending'
    });

    // Notify physiotherapist
    const physio = physiotherapists.find(p => p.id === selectedPhysiotherapist);
    const patient = patients.find(p => p.id === selectedPatient);
    
    addNotification({
      userId: selectedPhysiotherapist,
      type: 'appointment_requested',
      message: `New appointment scheduled for ${patient?.name} on ${new Date(date).toLocaleDateString()} at ${timeSlot}. Please review and approve.`,
      read: false
    });

    toast({
      title: "Appointment Booked",
      description: `Successfully booked appointment for ${patient?.name} with ${physio?.name}.`,
    });

    // Reset selections
    setSelectedPatient('');
    setSelectedPhysiotherapist('');
  };

  const todaysAppointments = appointments.filter(app => {
    const today = new Date().toISOString().split('T')[0];
    return app.date === today;
  });

  const pendingAppointments = appointments.filter(app => app.status === 'pending');

  return (
    <Layout title="Reception Portal">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-warning/10 to-primary/10 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Welcome, {user?.name}
          </h2>
          <p className="text-muted-foreground">
            Manage appointments and coordinate patient care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{todaysAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting doctor approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{patients.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered patients
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Booking Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Book New Appointment</span>
            </CardTitle>
            <CardDescription>
              Select patient, physiotherapist, and available time slot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Patient</label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Physiotherapist</label>
                <Select value={selectedPhysiotherapist} onValueChange={setSelectedPhysiotherapist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select physiotherapist" />
                  </SelectTrigger>
                  <SelectContent>
                    {physiotherapists.map((physio) => (
                      <SelectItem key={physio.id} value={physio.id}>
                        {physio.name} - {physio.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map((date) => (
                      <SelectItem key={date.value} value={date.value}>
                        {date.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedDate && (
              <div>
                <h3 className="font-medium mb-4">
                  Available Time Slots for {availableDates.find(d => d.value === selectedDate)?.label}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getTimeSlotsForDay(availableDates.find(d => d.value === selectedDate)?.day || '').map((timeSlot) => {
                    const isBooked = isSlotBooked(selectedDate, timeSlot);
                    const isBreakTime = timeSlot === '1:30 PM - 2:00 PM';
                    
                    if (isBreakTime) return null;

                    return (
                      <Button
                        key={timeSlot}
                        variant={isBooked ? "destructive" : "outline"}
                        className={`h-auto p-4 ${
                          !isBooked ? 'hover:bg-success hover:text-success-foreground border-success/50' : ''
                        }`}
                        disabled={isBooked || !selectedPatient || !selectedPhysiotherapist}
                        onClick={() => bookAppointment(selectedDate, timeSlot)}
                      >
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            {isBooked ? (
                              <AlertCircle className="h-4 w-4 mr-1" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                          </div>
                          <p className="text-sm font-medium">{timeSlot}</p>
                          <p className="text-xs opacity-75">
                            {isBooked ? 'Booked' : 'Available'}
                          </p>
                        </div>
                      </Button>
                    );
                  })}
                </div>
                
                <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Clinic hours are 7:00 AM - 5:00 PM, Monday to Saturday. 
                    Break time is 1:30 PM - 2:00 PM (no appointments). 
                    Saturday has limited slots (3 instead of 5).
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Today's Schedule</span>
            </CardTitle>
            <CardDescription>
              All appointments scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaysAppointments.length > 0 ? (
              <div className="space-y-3">
                {todaysAppointments
                  .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                  .map((appointment) => {
                    const patient = patients.find(p => p.id === appointment.patientId);
                    const physio = physiotherapists.find(p => p.id === appointment.physiotherapistId);
                    
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{appointment.timeSlot}</p>
                            <p className="text-sm text-muted-foreground">
                              {patient?.name} with {physio?.name}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          className={
                            appointment.status === 'approved' 
                              ? 'bg-success text-success-foreground'
                              : appointment.status === 'pending'
                              ? 'bg-warning text-warning-foreground'
                              : 'bg-destructive text-destructive-foreground'
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No appointments scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        {pendingAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-warning" />
                <span>Pending Approvals</span>
              </CardTitle>
              <CardDescription>
                Appointments waiting for doctor approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingAppointments.map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  const physio = physiotherapists.find(p => p.id === appointment.physiotherapistId);
                  
                  return (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-warning/20 bg-warning/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-warning/10 p-2 rounded-lg">
                          <User className="h-4 w-4 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">{patient?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.timeSlot}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {physio?.name}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-warning text-warning-foreground">
                        Pending Approval
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ReceptionistDashboard;