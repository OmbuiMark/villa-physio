import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/hooks/useData';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, Trash2, Shield, Calendar, FileText, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { patients, appointments, physiotherapists, addPhysiotherapist, removePhysiotherapist } = useData();
  const { toast } = useToast();
  const [isAddingPhysio, setIsAddingPhysio] = useState(false);
  const [newPhysio, setNewPhysio] = useState({
    name: '',
    email: '',
    specialization: ''
  });

  const handleAddPhysiotherapist = () => {
    if (!newPhysio.name || !newPhysio.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    addPhysiotherapist(newPhysio);
    setNewPhysio({ name: '', email: '', specialization: '' });
    setIsAddingPhysio(false);
    
    toast({
      title: "Physiotherapist Added",
      description: `Successfully added ${newPhysio.name} to the system.`,
    });
  };

  const handleRemovePhysiotherapist = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) {
      removePhysiotherapist(id);
      toast({
        title: "Physiotherapist Removed",
        description: `Successfully removed ${name} from the system.`,
      });
    }
  };

  const getPatientPhysiotherapist = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient?.assignedPhysiotherapist) return 'Unassigned';
    
    const physio = physiotherapists.find(p => p.id === patient.assignedPhysiotherapist);
    return physio?.name || 'Unknown';
  };

  const getAppointmentPatient = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return 'Unknown';
    
    const patient = patients.find(p => p.id === appointment.patientId);
    return patient?.name || 'Unknown';
  };

  const getAppointmentPhysiotherapist = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return 'Unknown';
    
    const physio = physiotherapists.find(p => p.id === appointment.physiotherapistId);
    return physio?.name || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  return (
    <Layout title="Admin Portal">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-destructive/10 to-primary/10 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage physiotherapists, view all patients, and monitor system activity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{patients.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Physiotherapists</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{physiotherapists.length}</div>
              <p className="text-xs text-muted-foreground">
                Active staff members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{appointments.length}</div>
              <p className="text-xs text-muted-foreground">
                All time bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {appointments.filter(a => a.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Physiotherapist Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Physiotherapist Management</span>
                </CardTitle>
                <CardDescription>
                  Add, remove, and manage physiotherapist accounts
                </CardDescription>
              </div>
              <Dialog open={isAddingPhysio} onOpenChange={setIsAddingPhysio}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Physiotherapist
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Physiotherapist</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new physiotherapist.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Dr. John Smith"
                        value={newPhysio.name}
                        onChange={(e) => setNewPhysio({ ...newPhysio, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.smith@clinic.com"
                        value={newPhysio.email}
                        onChange={(e) => setNewPhysio({ ...newPhysio, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        placeholder="Sports Medicine, Orthopedics, etc."
                        value={newPhysio.specialization}
                        onChange={(e) => setNewPhysio({ ...newPhysio, specialization: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingPhysio(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddPhysiotherapist}>
                        Add Physiotherapist
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Assigned Patients</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {physiotherapists.map((physio) => {
                    const assignedPatients = patients.filter(p => p.assignedPhysiotherapist === physio.id);
                    
                    return (
                      <TableRow key={physio.id}>
                        <TableCell className="font-medium">{physio.name}</TableCell>
                        <TableCell>{physio.email}</TableCell>
                        <TableCell>{physio.specialization || 'General'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {assignedPatients.length} patients
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemovePhysiotherapist(physio.id, physio.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* All Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>All Patients</span>
            </CardTitle>
            <CardDescription>
              Complete patient list with assigned physiotherapists
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Assigned Physiotherapist</TableHead>
                    <TableHead>Complaint</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => {
                    const assignedPhysio = physiotherapists.find(p => p.id === patient.assignedPhysiotherapist);
                    
                    return (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.age} years</TableCell>
                        <TableCell>{patient.phoneNumber}</TableCell>
                        <TableCell>
                          {assignedPhysio ? (
                            <Badge variant="outline">{assignedPhysio.name}</Badge>
                          ) : (
                            <Badge variant="secondary">Unassigned</Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{patient.complaint}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* All Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>All Appointments</span>
            </CardTitle>
            <CardDescription>
              Complete appointment history with patient and doctor details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Physiotherapist</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((appointment) => {
                      const patient = patients.find(p => p.id === appointment.patientId);
                      const physio = physiotherapists.find(p => p.id === appointment.physiotherapistId);
                      
                      return (
                        <TableRow key={appointment.id}>
                          <TableCell>{formatDate(appointment.date)}</TableCell>
                          <TableCell className="font-medium">{appointment.timeSlot}</TableCell>
                          <TableCell>{patient?.name || 'Unknown'}</TableCell>
                          <TableCell>{physio?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(appointment.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;