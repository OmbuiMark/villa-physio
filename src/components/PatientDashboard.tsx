import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/hooks/useData';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Phone, FileText, Heart, MessageSquare, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { patients, appointments, addNotification } = useData();
  const { toast } = useToast();
  const [requestSent, setRequestSent] = useState(false);

  // Find patient data - in real app this would be based on user ID
  const patientData = patients.find(p => p.name === user?.name) || patients[0];
  const patientAppointments = appointments.filter(a => a.patientId === patientData?.id);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleRequestAppointment = () => {
    addNotification({
      userId: 'reception@clinic.com',
      type: 'appointment_requested',
      message: `${patientData?.name} has requested a new appointment`,
      read: false
    });

    toast({
      title: "Appointment Request Sent",
      description: "Your appointment request has been sent to reception. You will be notified once it's processed.",
    });

    setRequestSent(true);
    
    // Reset the button after 3 seconds for demo purposes
    setTimeout(() => setRequestSent(false), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'declined': return 'bg-destructive text-destructive-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!patientData) {
    return (
      <Layout title="Patient Portal">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No patient data found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Patient Portal">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Welcome back, {patientData.name}!
          </h2>
          <p className="text-muted-foreground">
            Manage your profile and track your physiotherapy progress.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Your registered details in our system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="font-medium">{patientData.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p className="font-medium">{patientData.sex}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{new Date(patientData.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="font-medium">{calculateAge(patientData.dateOfBirth)} years</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Phone Number</p>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{patientData.phoneNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Medical Information</span>
              </CardTitle>
              <CardDescription>
                Your current complaint and treatment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Current Complaint</p>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <p className="text-sm">{patientData.complaint}</p>
                </div>
              </div>

              {patientData.homeProgram && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Home Exercise Program</p>
                  <div className="bg-accent/10 border border-accent/20 p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Heart className="h-4 w-4 text-accent mt-0.5" />
                      <p className="text-sm">{patientData.homeProgram}</p>
                    </div>
                  </div>
                </div>
              )}

              {patientData.comments && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Therapist Notes</p>
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                      <p className="text-sm">{patientData.comments}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Appointments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>My Appointments</span>
            </CardTitle>
            <CardDescription>
              View your scheduled and past appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patientAppointments.length > 0 ? (
              <div className="space-y-3">
                {patientAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{formatDate(appointment.date)}</p>
                        <p className="text-sm text-muted-foreground">{appointment.timeSlot}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No appointments scheduled</p>
                <p className="text-sm text-muted-foreground">
                  Request an appointment to get started with your treatment
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Appointment Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Request New Appointment</span>
            </CardTitle>
            <CardDescription>
              Send a request to our reception team to schedule your next appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary/50 p-4 rounded-lg mb-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">How it works:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Click the button below to send an appointment request</li>
                    <li>• Our reception team will review and schedule your appointment</li>
                    <li>• You'll receive a notification once your appointment is confirmed</li>
                    <li>• Your assigned physiotherapist will approve the final details</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleRequestAppointment}
              disabled={requestSent}
              className="w-full"
            >
              {requestSent ? 'Request Sent!' : 'Request Appointment'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PatientDashboard;