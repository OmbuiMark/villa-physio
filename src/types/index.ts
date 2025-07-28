export interface Patient {
  id: string;
  name: string;
  sex: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  age: number;
  phoneNumber: string;
  complaint: string;
  homeProgram?: string;
  comments?: string;
  assignedPhysiotherapist?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  physiotherapistId: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'approved' | 'declined' | 'completed';
  createdAt: string;
  approvedAt?: string;
}

export interface TimeSlot {
  id: string;
  day: string;
  time: string;
  isBooked: boolean;
  patientId?: string;
  physiotherapistId?: string;
}

export interface Physiotherapist {
  id: string;
  name: string;
  email: string;
  specialization?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment_approved' | 'appointment_declined' | 'appointment_requested';
  message: string;
  createdAt: string;
  read: boolean;
}