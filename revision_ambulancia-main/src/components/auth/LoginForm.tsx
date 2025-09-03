
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, LogIn } from 'lucide-react'; // Added LogIn for main button

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleTestUserLogin = (testEmail: string) => {
    setEmail(testEmail);
    setPassword("123456"); // Mock password
    // Auto-submit after setting values
    setTimeout(() => {
      handleSubmit(new Event('submit') as any);
    }, 100);
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        {/* Icono de ambulancia eliminado de aquí para coincidir con el nuevo diseño, se podría poner encima de la tarjeta en page.tsx si se desea */}
        <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder a AmbuGestión.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ej. alicia@ambureview.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <a href="#" className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4 pt-6">
        <div className="text-sm">
          ¿No tienes una cuenta?{' '}
          <a href="#" className="text-primary hover:underline">
            Crear cuenta
          </a>
        </div>

        <div className="w-full pt-4">
          <p className="text-center text-xs text-muted-foreground mb-3">Cuentas de prueba (contraseña: 123456)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { name: 'Alicia Coordinadora', email: 'alicia@ambureview.com' },
              { name: 'Ambulancia 01', email: 'amb001@ambureview.com' },
              { name: 'Carlos Usuario', email: 'carlos@ambureview.com' },
              { name: 'Admin Sistema', email: 'admin@ambureview.com' }
            ] as const).map((user) => (
              <Button
                key={user.email}
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleTestUserLogin(user.email)}
                disabled={loading}
              >
                {user.name}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
