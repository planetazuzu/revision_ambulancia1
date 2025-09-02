
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppData } from "@/contexts/AppDataContext";
import type { Alert as AppAlert, Space, Ambulance } from "@/types"; // Renamed to avoid conflict with Lucide Alert
import { format, parseISO } from "date-fns";
import { AlertTriangle, Wrench, ShieldAlert, Info, Archive, Sparkles, ClipboardCheck, PackageMinus, ArchiveX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { es } from 'date-fns/locale';

export default function AlertsPage() {
  const { alerts: contextAlerts, getAmbulanceById: getAnyAmbulanceById, getNotificationEmailConfig } = useAppData(); 
  const { user, loading: authLoading } = useAuth();
  const [apiAlerts, setApiAlerts] = useState<AppAlert[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [allAlerts, setAllAlerts] = useState<AppAlert[]>([]);
  const [isLoadingApiAlerts, setIsLoadingApiAlerts] = useState(true);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSpacesAndApiAlerts = async () => {
      setIsLoadingSpaces(true);
      setIsLoadingApiAlerts(true);
      let configuredEmail: string | null = null;
      if (user?.role === 'coordinador') {
        configuredEmail = getNotificationEmailConfig();
      }

      try {
        const spacesResponse = await fetch('/api/spaces');
        if (!spacesResponse.ok) throw new Error('No se pudieron cargar los espacios');
        const spacesData: Space[] = await spacesResponse.json();
        setSpaces(spacesData);
      } catch (error: any) {
        toast({ title: "Error", description: `No se pudieron cargar los espacios: ${error.message}`, variant: "destructive" });
      } finally {
        setIsLoadingSpaces(false);
      }

      try {
        const alertsResponse = await fetch('/api/ampulario/alerts'); 
        if (!alertsResponse.ok) throw new Error('No se pudieron cargar las alertas del inventario central');
        let fetchedApiAlerts: AppAlert[] = await alertsResponse.json();
        
        setApiAlerts(fetchedApiAlerts);

        if (configuredEmail) {
          fetchedApiAlerts.forEach(alert => {
            // Only toast for high severity central inventory alerts to avoid spam
            if (alert.severity === 'high' && (alert.type === 'ampulario_expired_material' || alert.type === 'low_stock_central')) {
              toast({
                title: `ALERTA CRÍTICA (Inv. Central): ${alert.type === 'ampulario_expired_material' ? 'Material Caducado' : 'Stock Bajo'}`,
                description: `${alert.message} Notificación simulada a ${configuredEmail}.`,
                variant: "destructive",
                duration: 10000
              });
            }
          });
        }

      } catch (error: any) {
        toast({ title: "Error", description: `No se pudieron cargar las alertas del inventario central: ${error.message}`, variant: "destructive" });
      } finally {
        setIsLoadingApiAlerts(false);
      }
    };
    if (!authLoading) {
        fetchSpacesAndApiAlerts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, authLoading, user]); 

  useEffect(() => {
    const combinedAlerts = [...contextAlerts, ...apiAlerts];
    const sortedAlerts = combinedAlerts.sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
    });
    setAllAlerts(sortedAlerts);
  }, [contextAlerts, apiAlerts]);


  const getIconForAlertType = (type: AppAlert['type'], severity: AppAlert['severity']) => {
    let colorClass = "text-muted-foreground"; 
    if (severity === 'high') colorClass = "text-destructive";
    else if (severity === 'medium') colorClass = "text-orange-500";

    switch (type) {
      case 'review_pending': return <Wrench className={`h-5 w-5 ${colorClass}`} />;
      case 'cleaning_pending': return <Sparkles className={`h-5 w-5 ${colorClass}`} />;
      case 'expiring_soon': return <ShieldAlert className={`h-5 w-5 ${colorClass}`} />;
      case 'expired_material': return <AlertTriangle className={`h-5 w-5 ${colorClass}`} />;
      case 'ampulario_expiring_soon': return <Archive className={`h-5 w-5 ${colorClass}`} />; 
      case 'ampulario_expired_material': return <Archive className={`h-5 w-5 ${colorClass}`} />; 
      case 'daily_check_pending': return <ClipboardCheck className={`h-5 w-5 ${colorClass}`} />;
      case 'low_stock_ambulance': return <PackageMinus className={`h-5 w-5 ${colorClass}`} />;
      case 'low_stock_central': return <ArchiveX className={`h-5 w-5 ${colorClass}`} />;
      default: return <Info className={`h-5 w-5 ${colorClass}`} />;
    }
  };

  const severityText = (severity: AppAlert['severity']) => {
    switch(severity) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return severity;
    }
  }

  const isLoading = isLoadingApiAlerts || isLoadingSpaces || authLoading;

  return (
    <div>
      <PageHeader
        title="Alertas del Sistema"
        description="Resumen de tareas pendientes, caducidad de materiales, stock bajo y otras notificaciones importantes."
      />

      <Card>
        <CardHeader>
          <CardTitle>Todas las Alertas Relevantes</CardTitle>
          <CardDescription>
            {isLoading && "Cargando alertas..."}
            {!isLoading && (allAlerts.length > 0
              ? `Mostrando ${allAlerts.length} alerta(s).`
              : "No hay alertas activas para tu vista. ¡El sistema funciona correctamente!")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="text-center py-10">
              <Info className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
              <p className="mt-4 text-lg font-medium">Cargando Alertas...</p>
            </div>
          ) : allAlerts.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-20rem)] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Tipo</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead>Contexto</TableHead> 
                    <TableHead>Gravedad</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allAlerts.map((alert) => {
                    const ambulance: Ambulance | undefined = alert.ambulanceId ? getAnyAmbulanceById(alert.ambulanceId) : undefined;
                    const space = alert.spaceId ? spaces.find(s => s.id === alert.spaceId) : null;
                    const contextName = ambulance 
                                        ? ambulance.name 
                                        : (space 
                                            ? space.name 
                                            : (alert.spaceId ? `Espacio ID: ${alert.spaceId}` : 'Sistema'));
                    
                    let actionLink = `/dashboard/ambulances/${alert.ambulanceId}/review`; // Default link
                    if (alert.type === 'daily_check_pending' && alert.ambulanceId) {
                        actionLink = `/dashboard/ambulances/${alert.ambulanceId}/daily-check`;
                    } else if (alert.type.startsWith('ampulario_') && alert.spaceId) {
                        actionLink = `/dashboard/ampulario?spaceId=${alert.spaceId}&materialId=${alert.materialId}`;
                    } else if (alert.type === 'low_stock_ambulance' && alert.ambulanceId) {
                        actionLink = `/dashboard/ambulances/${alert.ambulanceId}/inventory`;
                    } else if (alert.type === 'low_stock_central' && alert.spaceId) {
                        actionLink = `/dashboard/ampulario?spaceId=${alert.spaceId}&materialId=${alert.materialId}`;
                    }


                    let actionButtonText = "Ver Ambulancia";
                    if (alert.type.startsWith('ampulario_') || alert.type === 'low_stock_central') {
                        actionButtonText = "Ver Materiales Central";
                    } else if (alert.type === 'low_stock_ambulance') {
                        actionButtonText = "Ver Inventario Ambulancia";
                    }


                    return (
                      <TableRow key={alert.id} className={alert.severity === 'high' ? 'bg-destructive/5 hover:bg-destructive/10' : (alert.severity === 'medium' ? 'bg-orange-500/5 hover:bg-orange-500/10' : '')}>
                        <TableCell>{getIconForAlertType(alert.type, alert.severity)}</TableCell>
                        <TableCell className="font-medium">{alert.message}</TableCell>
                        <TableCell>{contextName}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                            ${alert.severity === 'high' ? 'bg-destructive text-destructive-foreground' :
                              alert.severity === 'medium' ? 'bg-orange-500 text-white' :
                              'bg-muted text-muted-foreground'}`}>
                            {severityText(alert.severity)}
                          </span>
                        </TableCell>
                        <TableCell>{format(parseISO(alert.createdAt), 'PPP', {locale: es})}</TableCell>
                        <TableCell className="text-right">
                          {(alert.ambulanceId || alert.spaceId) && ( // Condition to show button if context exists
                            <Button variant="outline" size="sm" asChild>
                              <Link href={actionLink}>
                                {actionButtonText}
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-center py-10">
              <Info className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">¡Todo en orden!</p>
              <p className="text-muted-foreground">No hay alertas pendientes para tu vista actual.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
