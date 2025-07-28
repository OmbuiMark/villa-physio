import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'patient' | 'physiotherapist' | 'receptionist' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: Record<string, { password: string; user: User }> = {
  'patient@clinic.com': {
    password: 'patient123',
    user: { id: '1', name: 'John Patient', role: 'patient', email: 'patient@clinic.com' }
  },
  'physio1@clinic.com': {
    password: 'physio123',
    user: { id: '2', name: 'Dr. Sarah Wilson', role: 'physiotherapist', email: 'physio1@clinic.com' }
  },
  'physio2@clinic.com': {
    password: 'physio123',
    user: { id: '3', name: 'Dr. Mike Johnson', role: 'physiotherapist', email: 'physio2@clinic.com' }
  },
  'physio3@clinic.com': {
    password: 'physio123',
    user: { id: '4', name: 'Dr. Emily Davis', role: 'physiotherapist', email: 'physio3@clinic.com' }
  },
  'physio4@clinic.com': {
    password: 'physio123',
    user: { id: '5', name: 'Dr. James Brown', role: 'physiotherapist', email: 'physio4@clinic.com' }
  },
  'physio5@clinic.com': {
    password: 'physio123',
    user: { id: '6', name: 'Dr. Lisa Garcia', role: 'physiotherapist', email: 'physio5@clinic.com' }
  },
  'reception@clinic.com': {
    password: 'reception123',
    user: { id: '7', name: 'Mary Reception', role: 'receptionist', email: 'reception@clinic.com' }
  },
  'admin@clinic.com': {
    password: 'admin123',
    user: { id: '8', name: 'Admin User', role: 'admin', email: 'admin@clinic.com' }
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    const mockUser = mockUsers[email];
    
    if (mockUser && mockUser.password === password && mockUser.user.role === role) {
      setUser(mockUser.user);
      localStorage.setItem('user', JSON.stringify(mockUser.user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};