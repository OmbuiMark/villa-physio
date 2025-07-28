import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/hooks/useData';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, FileText, Clock, Calendar, Edit, Check, User, Phone, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';

const PhysiotherapistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { patients, appointments, updatePatient, updateAppointment, addNotification } = useData();
  const { toast } = useToast();
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [homeProgram, setHomeProgram] = useState('');
  const [comments, setComments] = useState('');

  // Find physiotherapist's assigned patients
  const assignedPatients = patients.filter(p => p.assignedPhysiotherapist === user?.id);
  const physiotherapistAppointments = appointments.filter(a => a.physiotherapistId === user?.id);
  const pendingAppointments = physiotherapistAppointments.filter(a => a.status === 'pending');

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

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setHomeProgram(patient.homeProgram || '');
    setComments(patient.comments || '');
  };

  const savePatientUpdates = () => {
    if (!editingPatient) return;

    const updatedPatient = {
      ...editingPatient,
      homeProgram,
      comments
    };

    updatePatient(updatedPatient);
    setEditingPatient(null);

    toast({
      title: "Patient Updated",
      description: `Successfully updated ${editingPatient.name}'s information.`,
    });
  };

  const approveAppointment = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    const updatedAppointment = {
      ...appointment,
      status: 'approved' as const,
      approvedAt: new Date().toISOString()
    };

    updateAppointment(updatedAppointment);

    // Notify patient (without doctor name)
    addNotification({
      userId: appointment.patientId,
      type: 'appointment_approved',
      message: `Your appointment on ${appointment.date} at ${appointment.timeSlot} has been approved.`,
      read: false
    });

    // Notify receptionist (with doctor name)
    addNotification({
      userId: 'reception@clinic.com',
      type: 'appointment_approved',
      message: `Dr. ${user?.name} approved appointment for patient on ${appointment.date} at ${appointment.timeSlot}.`,
      read: false
    });

    toast({
      title: "Appointment Approved",
      description: "Patient and reception have been notified.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout title="Physiotherapist Portal">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Welcome, Dr. {user?.name?.split(' ').slice(1).join(' ')}
          </h2>
          <p className="text-muted-foreground">
            Manage your patients and appointments efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{assignedPatients.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently under your care
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
                Appointments awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">3</div>
              <p className="text-xs text-muted-foreground">
                Appointments scheduled today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Appointments */}
        {pendingAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-warning" />
                <span>Pending Appointments</span>
              </CardTitle>
              <CardDescription>
                Appointments waiting for your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingAppointments.map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  return (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-warning/20 bg-warning/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-warning/10 p-2 rounded-lg">
                          <User className="h-4 w-4 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">{patient?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(appointment.date)} at {appointment.timeSlot}
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => approveAppointment(appointment.id)}>
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>My Patients</span>
            </CardTitle>
            <CardDescription>
              Patients currently under your care
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignedPatients.length > 0 ? (
              <div className="space-y-4">
                {assignedPatients.map((patient) => (
                  <div key={patient.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{patient.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {patient.sex}, {calculateAge(patient.dateOfBirth)} years
                          </p>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(patient)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Patient: {patient.name}</DialogTitle>
                            <DialogDescription>
                              Update home program and add comments for this patient.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Patient Basic Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-muted-foreground">Phone</p>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <p>{patient.phoneNumber}</p>
                                </div>
                              </div>
                              <div>
                                <p className="font-medium text-muted-foreground">Date of Birth</p>
                                <p>{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                              </div>
                            </div>

                            <div>
                              <p className="font-medium text-muted-foreground mb-2">Current Complaint</p>
                              <div className="bg-secondary/50 p-3 rounded-lg">
                                <p className="text-sm">{patient.complaint}</p>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Home Exercise Program
                                </label>
                                <Textarea
                                  placeholder="Enter home exercise program and instructions..."
                                  value={homeProgram}
                                  onChange={(e) => setHomeProgram(e.target.value)}
                                  rows={4}
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Treatment Notes & Comments
                                </label>
                                <Textarea
                                  placeholder="Add your notes and comments about the patient's progress..."
                                  value={comments}
                                  onChange={(e) => setComments(e.target.value)}
                                  rows={4}
                                />
                              </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setEditingPatient(null)}>
                                Cancel
                              </Button>
                              <Button onClick={savePatientUpdates}>
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Contact</p>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p>{patient.phoneNumber}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Age</p>
                        <p>{calculateAge(patient.dateOfBirth)} years</p>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Complaint</p>
                        <p className="text-sm bg-secondary/50 p-2 rounded">{patient.complaint}</p>
                      </div>

                      {patient.homeProgram && (
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Current Home Program</p>
                          <div className="bg-accent/10 border border-accent/20 p-3 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <Heart className="h-4 w-4 text-accent mt-0.5" />
                              <p className="text-sm">{patient.homeProgram}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {patient.comments && (
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Treatment Notes</p>
                          <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <FileText className="h-4 w-4 text-primary mt-0.5" />
                              <p className="text-sm">{patient.comments}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No patients assigned to you yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PhysiotherapistDashboard;