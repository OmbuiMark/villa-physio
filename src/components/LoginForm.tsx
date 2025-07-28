import React, { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password, role);
      if (!success) {
        toast({
          title: "Login Failed",
          description: "Invalid email, password, or role selection.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = {
    patient: { email: 'patient@clinic.com', password: 'patient123' },
    physiotherapist: { email: 'physio1@clinic.com', password: 'physio123' },
    receptionist: { email: 'reception@clinic.com', password: 'reception123' },
    admin: { email: 'admin@clinic.com', password: 'admin123' }
  };

  const fillDemo = (userRole: UserRole) => {
    setEmail(demoCredentials[userRole].email);
    setPassword(demoCredentials[userRole].password);
    setRole(userRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <Stethoscope className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">PhysioClinic</CardTitle>
          <CardDescription>
            Welcome to our physiotherapy management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="physiotherapist">Physiotherapist</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleLogin} 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Demo Accounts - Quick Access:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemo('patient')}
                className="text-xs"
              >
                Patient Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemo('physiotherapist')}
                className="text-xs"
              >
                Physio Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemo('receptionist')}
                className="text-xs"
              >
                Reception Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemo('admin')}
                className="text-xs"
              >
                Admin Demo
              </Button>
            </div>
          </div>

          <div className="bg-secondary/50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Demo System</p>
                <p>This is a demonstration system with pre-populated data. Use the demo buttons above for quick access.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;