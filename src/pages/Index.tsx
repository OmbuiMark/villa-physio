import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import PatientDashboard from '@/components/PatientDashboard';
import PhysiotherapistDashboard from '@/components/PhysiotherapistDashboard';
import ReceptionistDashboard from '@/components/ReceptionistDashboard';
import AdminDashboard from '@/components/AdminDashboard';

const Index = () => {
  const { user, isAuthenticated } = useAuth();

  // Show login form if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'physiotherapist':
      return <PhysiotherapistDashboard />;
    case 'receptionist':
      return <ReceptionistDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <LoginForm />;
  }
};

export default Index;
