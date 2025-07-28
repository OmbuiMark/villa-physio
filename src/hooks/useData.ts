import { useState, useEffect } from 'react';
import { Patient, Appointment, Physiotherapist, Notification, TimeSlot } from '@/types';

// Mock data store - in a real app this would connect to your backend
class DataStore {
  private patients: Patient[] = [
    {
      id: '1',
      name: 'John Patient',
      sex: 'Male',
      dateOfBirth: '1985-05-15',
      age: 39,
      phoneNumber: '+1234567890',
      complaint: 'Lower back pain for 3 months, worsens with sitting',
      homeProgram: 'Daily walking 30 minutes, core strengthening exercises',
      comments: 'Patient shows good compliance with exercises',
      assignedPhysiotherapist: '2'
    },
    {
      id: '2',
      name: 'Sarah Williams',
      sex: 'Female',
      dateOfBirth: '1990-08-22',
      age: 34,
      phoneNumber: '+1987654321',
      complaint: 'Right shoulder pain after sports injury',
      assignedPhysiotherapist: '3'
    },
    {
      id: '3',
      name: 'Michael Brown',
      sex: 'Male',
      dateOfBirth: '1978-12-10',
      age: 45,
      phoneNumber: '+1122334455',
      complaint: 'Knee pain and stiffness, difficulty with stairs',
      assignedPhysiotherapist: '4'
    }
  ];

  private appointments: Appointment[] = [
    {
      id: '1',
      patientId: '1',
      physiotherapistId: '2',
      date: '2024-01-15',
      timeSlot: '9:00 AM - 10:30 AM',
      status: 'approved',
      createdAt: '2024-01-10T10:00:00Z',
      approvedAt: '2024-01-10T14:00:00Z'
    }
  ];

  private physiotherapists: Physiotherapist[] = [
    { id: '2', name: 'Dr. Sarah Wilson', email: 'physio1@clinic.com', specialization: 'Sports Medicine' },
    { id: '3', name: 'Dr. Mike Johnson', email: 'physio2@clinic.com', specialization: 'Orthopedics' },
    { id: '4', name: 'Dr. Emily Davis', email: 'physio3@clinic.com', specialization: 'Neurological' },
    { id: '5', name: 'Dr. James Brown', email: 'physio4@clinic.com', specialization: 'Pediatric' },
    { id: '6', name: 'Dr. Lisa Garcia', email: 'physio5@clinic.com', specialization: 'Geriatric' }
  ];

  private notifications: Notification[] = [];

  private timeSlots: TimeSlot[] = [];

  constructor() {
    this.generateTimeSlots();
  }

  private generateTimeSlots() {
    const slots = [
      '7:00 AM - 8:30 AM',
      '9:00 AM - 10:30 AM',
      '10:30 AM - 12:00 PM',
      '12:00 PM - 1:30 PM',
      '2:00 PM - 3:30 PM',
      '3:30 PM - 5:00 PM'
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    days.forEach(day => {
      const maxSlots = day === 'Saturday' ? 3 : 5;
      slots.slice(0, maxSlots).forEach((time, index) => {
        if (time !== '1:30 PM - 2:00 PM') { // Skip break time
          this.timeSlots.push({
            id: `${day}-${index}`,
            day,
            time,
            isBooked: false
          });
        }
      });
    });
  }

  getPatients(): Patient[] {
    return this.patients;
  }

  getPatientById(id: string): Patient | undefined {
    return this.patients.find(p => p.id === id);
  }

  updatePatient(patient: Patient): void {
    const index = this.patients.findIndex(p => p.id === patient.id);
    if (index !== -1) {
      this.patients[index] = patient;
    }
  }

  getAppointments(): Appointment[] {
    return this.appointments;
  }

  createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    this.appointments.push(newAppointment);
    return newAppointment;
  }

  updateAppointment(appointment: Appointment): void {
    const index = this.appointments.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      this.appointments[index] = appointment;
    }
  }

  getPhysiotherapists(): Physiotherapist[] {
    return this.physiotherapists;
  }

  addPhysiotherapist(physio: Omit<Physiotherapist, 'id'>): Physiotherapist {
    const newPhysio: Physiotherapist = {
      ...physio,
      id: Date.now().toString()
    };
    this.physiotherapists.push(newPhysio);
    return newPhysio;
  }

  removePhysiotherapist(id: string): void {
    this.physiotherapists = this.physiotherapists.filter(p => p.id !== id);
  }

  getTimeSlots(): TimeSlot[] {
    return this.timeSlots;
  }

  bookTimeSlot(slotId: string, patientId: string, physiotherapistId: string): void {
    const slot = this.timeSlots.find(s => s.id === slotId);
    if (slot) {
      slot.isBooked = true;
      slot.patientId = patientId;
      slot.physiotherapistId = physiotherapistId;
    }
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): void {
    this.notifications.push({
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    });
  }
}

const dataStore = new DataStore();

export const useData = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    // Load initial data
    setPatients(dataStore.getPatients());
    setAppointments(dataStore.getAppointments());
    setPhysiotherapists(dataStore.getPhysiotherapists());
    setNotifications(dataStore.getNotifications());
    setTimeSlots(dataStore.getTimeSlots());
  }, []);

  const updatePatient = (patient: Patient) => {
    dataStore.updatePatient(patient);
    setPatients(dataStore.getPatients());
  };

  const createAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment = dataStore.createAppointment(appointment);
    setAppointments(dataStore.getAppointments());
    return newAppointment;
  };

  const updateAppointment = (appointment: Appointment) => {
    dataStore.updateAppointment(appointment);
    setAppointments(dataStore.getAppointments());
  };

  const addPhysiotherapist = (physio: Omit<Physiotherapist, 'id'>) => {
    const newPhysio = dataStore.addPhysiotherapist(physio);
    setPhysiotherapists(dataStore.getPhysiotherapists());
    return newPhysio;
  };

  const removePhysiotherapist = (id: string) => {
    dataStore.removePhysiotherapist(id);
    setPhysiotherapists(dataStore.getPhysiotherapists());
  };

  const bookTimeSlot = (slotId: string, patientId: string, physiotherapistId: string) => {
    dataStore.bookTimeSlot(slotId, patientId, physiotherapistId);
    setTimeSlots(dataStore.getTimeSlots());
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    dataStore.addNotification(notification);
    setNotifications(dataStore.getNotifications());
  };

  return {
    patients,
    appointments,
    physiotherapists,
    notifications,
    timeSlots,
    updatePatient,
    createAppointment,
    updateAppointment,
    addPhysiotherapist,
    removePhysiotherapist,
    bookTimeSlot,
    addNotification
  };
};