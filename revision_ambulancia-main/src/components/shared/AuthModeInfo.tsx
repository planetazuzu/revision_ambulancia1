"use client";

import { MOCK_MODE } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Server, Users, Shield } from 'lucide-react';

export function AuthModeInfo() {
  if (!MOCK_MODE) return null;

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Database className="h-5 w-5 text-yellow-600" />
          Modo de Prueba
        </CardTitle>
        <CardDescription>
          Sistema de autenticación con datos mock para desarrollo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Cuentas de Prueba Disponibles:
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span>Alicia Coordinadora</span>
              <Badge variant="outline" className="text-xs">coordinador</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Ambulancia 01</span>
              <Badge variant="outline" className="text-xs">usuario</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Carlos Usuario</span>
              <Badge variant="outline" className="text-xs">usuario</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Admin Sistema</span>
              <Badge variant="outline" className="text-xs">admin</Badge>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <Shield className="h-3 w-3 inline mr-1" />
            Contraseña para todas las cuentas: <strong>123456</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function BackendModeInfo() {
  if (MOCK_MODE) return null;

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Server className="h-5 w-5 text-green-600" />
          Modo Producción
        </CardTitle>
        <CardDescription>
          Sistema de autenticación con backend real y JWT
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Características:
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Autenticación JWT segura</li>
            <li>• Base de datos PostgreSQL</li>
            <li>• Validación de credenciales real</li>
            <li>• Gestión de sesiones</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
