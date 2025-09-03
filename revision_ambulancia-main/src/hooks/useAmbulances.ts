import { useState, useEffect, useCallback } from 'react';
import { ambulancesService } from '@/lib/services';
import type { Ambulance } from '@/types';
import type { CreateAmbulanceRequest, UpdateAmbulanceRequest, AmbulanceCheckInRequest } from '@/lib/services';

interface UseAmbulancesReturn {
  ambulances: Ambulance[];
  loading: boolean;
  error: string | null;
  createAmbulance: (data: CreateAmbulanceRequest) => Promise<Ambulance>;
  updateAmbulance: (id: string, data: UpdateAmbulanceRequest) => Promise<Ambulance>;
  deleteAmbulance: (id: string) => Promise<void>;
  checkInAmbulance: (id: string, data: AmbulanceCheckInRequest) => Promise<Ambulance>;
  updateWorkflowStep: (id: string, step: 'dailyCheck' | 'mechanical' | 'cleaning' | 'inventory', status: boolean) => Promise<Ambulance>;
  refreshAmbulances: () => Promise<void>;
  getAmbulanceById: (id: string) => Ambulance | undefined;
  getAmbulanceByName: (name: string) => Ambulance | undefined;
}

export function useAmbulances(): UseAmbulancesReturn {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAmbulances = useCallback(async () => {
    try {
      setError(null);
      const data = await ambulancesService.getAll();
      setAmbulances(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ambulances');
      console.error('Failed to fetch ambulances:', err);
    }
  }, []);

  useEffect(() => {
    const loadAmbulances = async () => {
      setLoading(true);
      await refreshAmbulances();
      setLoading(false);
    };

    loadAmbulances();
  }, [refreshAmbulances]);

  const createAmbulance = useCallback(async (data: CreateAmbulanceRequest): Promise<Ambulance> => {
    try {
      setError(null);
      const newAmbulance = await ambulancesService.create(data);
      setAmbulances(prev => [...prev, newAmbulance]);
      return newAmbulance;
    } catch (err: any) {
      setError(err.message || 'Failed to create ambulance');
      throw err;
    }
  }, []);

  const updateAmbulance = useCallback(async (id: string, data: UpdateAmbulanceRequest): Promise<Ambulance> => {
    try {
      setError(null);
      const updatedAmbulance = await ambulancesService.update(id, data);
      setAmbulances(prev => prev.map(amb => amb.id === id ? updatedAmbulance : amb));
      return updatedAmbulance;
    } catch (err: any) {
      setError(err.message || 'Failed to update ambulance');
      throw err;
    }
  }, []);

  const deleteAmbulance = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await ambulancesService.delete(id);
      setAmbulances(prev => prev.filter(amb => amb.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete ambulance');
      throw err;
    }
  }, []);

  const checkInAmbulance = useCallback(async (id: string, data: AmbulanceCheckInRequest): Promise<Ambulance> => {
    try {
      setError(null);
      const updatedAmbulance = await ambulancesService.checkIn(id, data);
      setAmbulances(prev => prev.map(amb => amb.id === id ? updatedAmbulance : amb));
      return updatedAmbulance;
    } catch (err: any) {
      setError(err.message || 'Failed to check in ambulance');
      throw err;
    }
  }, []);

  const updateWorkflowStep = useCallback(async (id: string, step: 'dailyCheck' | 'mechanical' | 'cleaning' | 'inventory', status: boolean): Promise<Ambulance> => {
    try {
      setError(null);
      const updatedAmbulance = await ambulancesService.updateWorkflowStep(id, step, status);
      setAmbulances(prev => prev.map(amb => amb.id === id ? updatedAmbulance : amb));
      return updatedAmbulance;
    } catch (err: any) {
      setError(err.message || 'Failed to update workflow step');
      throw err;
    }
  }, []);

  const getAmbulanceById = useCallback((id: string): Ambulance | undefined => {
    return ambulances.find(amb => amb.id === id);
  }, [ambulances]);

  const getAmbulanceByName = useCallback((name: string): Ambulance | undefined => {
    return ambulances.find(amb => amb.name.toLowerCase() === name.toLowerCase());
  }, [ambulances]);

  return {
    ambulances,
    loading,
    error,
    createAmbulance,
    updateAmbulance,
    deleteAmbulance,
    checkInAmbulance,
    updateWorkflowStep,
    refreshAmbulances,
    getAmbulanceById,
    getAmbulanceByName,
  };
}
