
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { AlertTriangle, Ambulance, Box, CheckCircle, ShieldAlert, Sparkles, Wrench, Info, Users, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardPage() {
  const { user, login, loading: authLoading } = useAuth();
  const { alerts, ambulances, getAllAmbulancesCount } = useAppData();

  const highSeverityAlerts = alerts.filter(alert => alert.severity === 'high');
  const mediumSeverityAlerts = alerts.filter(alert => alert.severity === 'medium');
  const totalAmbulancesInSystem = getAllAmbulancesCount();

  const getIconForAlertType = (type: string) => {
    switch (type) {
      case 'review_pending': return <Wrench className="h-5 w-5 text-yellow-500" />;
      case 'cleaning_pending': return <Sparkles className="h-5 w-5 text-blue-400" />;
      case 'expiring_soon': return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
      case 'expired_material': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'ampulario_expiring_soon': return <ShieldAlert className="h-5 w-5 text-yellow-500" />; // Type name in DB remains
      case 'ampulario_expired_material': return <AlertTriangle className="h-5 w-5 text-red-500" />; // Type name in DB remains
      default: return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getAmbulanceStatus = (ambulance: typeof ambulances[0]) => {
    if (!ambulance.mechanicalReviewCompleted) return { text: "Necesita Revisión Mecánica", Icon: Wrench, color: "text-orange-500", path: `/dashboard/ambulances/${ambulance.id}/review` };
    if (!ambulance.cleaningCompleted) return { text: "Necesita Limpieza", Icon: Sparkles, color: "text-blue-500", path: `/dashboard/ambulances/${ambulance.id}/cleaning` };
    if (!ambulance.inventoryCompleted) return { text: "Necesita Control de Inventario", Icon: Box, color: "text-purple-500", path: `/dashboard/ambulances/${ambulance.id}/inventory` };
    return { text: "Todas las revisiones completas", Icon: CheckCircle, color: "text-green-500", path: `/dashboard/ambulances/${ambulance.id}/review`};
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Info className="h-10 w-10 animate-pulse mr-3" />
        <p className="text-lg">Cargando datos de usuario...</p>
      </div>
    );
  }
  
  const pageDescription = user?.role === 'coordinador' 
    ? `Aquí tienes un resumen del estado de tu flota de ${totalAmbulancesInSystem} ambulancia(s).`
    : (ambulances.length === 1 ? `Resumen del estado de tu ambulancia asignada: ${ambulances[0].name}.` 
    : (user?.role === 'usuario' ? "No tienes una ambulancia asignada para ver un resumen." : "Bienvenido al sistema."));

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title={`¡Bienvenido, ${user?.name || 'Usuario'}!`}
        description={pageDescription}
      />

      {user?.role === 'coordinador' && ( 
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6" /> Cambio Rápido de Usuario (Coordinador)</CardTitle>
            <CardDescription>Prueba la aplicación desde la perspectiva de diferentes roles.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => login('Alicia Coordinadora')} variant="secondary" className="flex-1">
              <LogIn className="mr-2 h-4 w-4" /> Iniciar como Alicia (Coordinador)
            </Button>
            <Button onClick={() => login('Ambulancia 01')} variant="outline" className="flex-1">
             <LogIn className="mr-2 h-4 w-4" /> Iniciar como Ambulancia 01 (Usuario Asignado)
            </Button>
            <Button onClick={() => login('Carlos Usuario')} variant="outline" className="flex-1">
              <LogIn className="mr-2 h-4 w-4" /> Iniciar como Carlos (Usuario No Asignado)
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Alertas Urgentes</CardTitle>
            <CardDescription>Estos elementos requieren atención inmediata.</CardDescription>
          </CardHeader>
          <CardContent>
            {highSeverityAlerts.length > 0 ? (
              <ScrollArea className="h-[200px]">
              <ul className="space-y-3">
                {highSeverityAlerts.map(alert => (
                  <li key={alert.id} className="flex items-start gap-3 p-3 bg-destructive/10 rounded-md">
                    {getIconForAlertType(alert.type)}
                    <div>
                      <p className="font-medium text-sm text-destructive">{alert.message}</p>
                      {alert.ambulanceId && (
                         <Button variant="link" size="sm" className="p-0 h-auto text-destructive hover:text-destructive/80" asChild>
                            <Link href={`/dashboard/ambulances/${alert.ambulanceId}/review`}>Ver Ambulancia</Link>
                         </Button>
                      )}
                       {alert.type.startsWith('ampulario_') && ( // type name in DB remains
                         <Button variant="link" size="sm" className="p-0 h-auto text-destructive hover:text-destructive/80" asChild>
                            {/* The target URL /dashboard/ampulario remains the same */}
                            <Link href={`/dashboard/ampulario?spaceId=${alert.spaceId}&materialId=${alert.materialId}`}>Ver Materiales</Link>
                         </Button>
                       )}
                    </div>
                  </li>
                ))}
              </ul>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground">No hay alertas de alta gravedad. ¡Buen trabajo!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Pendientes</CardTitle>
            <CardDescription>Elementos que necesitan tu atención pronto.</CardDescription>
          </CardHeader>
          <CardContent>
             {mediumSeverityAlerts.length > 0 ? (
              <ScrollArea className="h-[200px]">
              <ul className="space-y-3">
                {mediumSeverityAlerts.map(alert => (
                  <li key={alert.id} className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-md">
                    {getIconForAlertType(alert.type)}
                     <div>
                      <p className="font-medium text-sm text-orange-600">{alert.message}</p>
                       {alert.ambulanceId && (
                         <Button variant="link" size="sm" className="p-0 h-auto text-orange-600 hover:text-orange-500" asChild>
                            <Link href={`/dashboard/ambulances/${alert.ambulanceId}/review`}>Ver Ambulancia</Link>
                         </Button>
                      )}
                        {alert.type.startsWith('ampulario_') && ( // type name in DB remains
                         <Button variant="link" size="sm" className="p-0 h-auto text-orange-600 hover:text-orange-500" asChild>
                            {/* The target URL /dashboard/ampulario remains the same */}
                            <Link href={`/dashboard/ampulario?spaceId=${alert.spaceId}&materialId=${alert.materialId}`}>Ver Materiales</Link>
                         </Button>
                       )}
                    </div>
                  </li>
                ))}
              </ul>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground">No hay alertas de gravedad media actualmente.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Resumen del Estado de Ambulancias</CardTitle>
            <CardDescription>
              {user?.role === 'coordinador' 
                ? "Vista rápida de las tareas actuales para cada ambulancia."
                : (ambulances.length >= 1 ? "Tareas actuales para tu ambulancia asignada." : "")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ambulances.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ambulances.map(ambulance => {
                  const status = getAmbulanceStatus(ambulance);
                  return (
                    <Card key={ambulance.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Ambulance className="h-6 w-6 text-primary" />
                          {ambulance.name}
                        </CardTitle>
                        <CardDescription>{ambulance.licensePlate}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <status.Icon className={`h-5 w-5 ${status.color}`} />
                          <p className={`text-sm font-medium ${status.color}`}>{status.text}</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full">
                           <Link href={status.path}>
                             {status.text === "Todas las revisiones completas" ? "Ver Detalles" : "Ir a Tarea"}
                           </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              user?.role === 'coordinador' ? (
                <p className="text-muted-foreground">Aún no hay ambulancias registradas. <Link href="/dashboard/ambulances" className="text-primary hover:underline">Añade una ambulancia</Link> para empezar.</p>
              ) : (
                <p className="text-muted-foreground">No tienes una ambulancia asignada. Contacta a un coordinador.</p>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
