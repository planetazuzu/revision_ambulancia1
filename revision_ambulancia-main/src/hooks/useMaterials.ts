import { useState, useEffect, useCallback } from 'react';
import { materialsService } from '@/lib/services';
import type { ConsumableMaterial, NonConsumableMaterial } from '@/types';
import type { 
  CreateConsumableMaterialRequest, 
  UpdateConsumableMaterialRequest,
  CreateNonConsumableMaterialRequest,
  UpdateNonConsumableMaterialRequest
} from '@/lib/services';

interface UseMaterialsReturn {
  consumableMaterials: ConsumableMaterial[];
  nonConsumableMaterials: NonConsumableMaterial[];
  loading: boolean;
  error: string | null;
  
  // Consumable Materials
  createConsumableMaterial: (data: CreateConsumableMaterialRequest) => Promise<ConsumableMaterial>;
  updateConsumableMaterial: (id: string, data: UpdateConsumableMaterialRequest) => Promise<ConsumableMaterial>;
  deleteConsumableMaterial: (id: string) => Promise<void>;
  getConsumableMaterialsByAmbulanceId: (ambulanceId: string) => ConsumableMaterial[];
  
  // Non-Consumable Materials
  createNonConsumableMaterial: (data: CreateNonConsumableMaterialRequest) => Promise<NonConsumableMaterial>;
  updateNonConsumableMaterial: (id: string, data: UpdateNonConsumableMaterialRequest) => Promise<NonConsumableMaterial>;
  deleteNonConsumableMaterial: (id: string) => Promise<void>;
  getNonConsumableMaterialsByAmbulanceId: (ambulanceId: string) => NonConsumableMaterial[];
  
  // Bulk Operations
  importMaterials: (file: File, ambulanceId: string) => Promise<{ consumable: ConsumableMaterial[]; nonConsumable: NonConsumableMaterial[]; }>;
  exportMaterials: (ambulanceId?: string) => Promise<Blob>;
  
  // Alerts
  getExpiringMaterials: (days?: number) => Promise<ConsumableMaterial[]>;
  getLowStockMaterials: () => Promise<{ consumable: ConsumableMaterial[]; nonConsumable: NonConsumableMaterial[]; }>;
  
  refreshMaterials: () => Promise<void>;
}

export function useMaterials(ambulanceId?: string): UseMaterialsReturn {
  const [consumableMaterials, setConsumableMaterials] = useState<ConsumableMaterial[]>([]);
  const [nonConsumableMaterials, setNonConsumableMaterials] = useState<NonConsumableMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMaterials = useCallback(async () => {
    try {
      setError(null);
      const [consumable, nonConsumable] = await Promise.all([
        materialsService.getConsumableMaterials(ambulanceId),
        materialsService.getNonConsumableMaterials(ambulanceId)
      ]);
      setConsumableMaterials(consumable);
      setNonConsumableMaterials(nonConsumable);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch materials');
      console.error('Failed to fetch materials:', err);
    }
  }, [ambulanceId]);

  useEffect(() => {
    const loadMaterials = async () => {
      setLoading(true);
      await refreshMaterials();
      setLoading(false);
    };

    loadMaterials();
  }, [refreshMaterials]);

  // Consumable Materials
  const createConsumableMaterial = useCallback(async (data: CreateConsumableMaterialRequest): Promise<ConsumableMaterial> => {
    try {
      setError(null);
      const newMaterial = await materialsService.createConsumableMaterial(data);
      setConsumableMaterials(prev => [...prev, newMaterial]);
      return newMaterial;
    } catch (err: any) {
      setError(err.message || 'Failed to create consumable material');
      throw err;
    }
  }, []);

  const updateConsumableMaterial = useCallback(async (id: string, data: UpdateConsumableMaterialRequest): Promise<ConsumableMaterial> => {
    try {
      setError(null);
      const updatedMaterial = await materialsService.updateConsumableMaterial(id, data);
      setConsumableMaterials(prev => prev.map(mat => mat.id === id ? updatedMaterial : mat));
      return updatedMaterial;
    } catch (err: any) {
      setError(err.message || 'Failed to update consumable material');
      throw err;
    }
  }, []);

  const deleteConsumableMaterial = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await materialsService.deleteConsumableMaterial(id);
      setConsumableMaterials(prev => prev.filter(mat => mat.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete consumable material');
      throw err;
    }
  }, []);

  const getConsumableMaterialsByAmbulanceId = useCallback((ambulanceId: string): ConsumableMaterial[] => {
    return consumableMaterials.filter(mat => mat.ambulanceId === ambulanceId);
  }, [consumableMaterials]);

  // Non-Consumable Materials
  const createNonConsumableMaterial = useCallback(async (data: CreateNonConsumableMaterialRequest): Promise<NonConsumableMaterial> => {
    try {
      setError(null);
      const newMaterial = await materialsService.createNonConsumableMaterial(data);
      setNonConsumableMaterials(prev => [...prev, newMaterial]);
      return newMaterial;
    } catch (err: any) {
      setError(err.message || 'Failed to create non-consumable material');
      throw err;
    }
  }, []);

  const updateNonConsumableMaterial = useCallback(async (id: string, data: UpdateNonConsumableMaterialRequest): Promise<NonConsumableMaterial> => {
    try {
      setError(null);
      const updatedMaterial = await materialsService.updateNonConsumableMaterial(id, data);
      setNonConsumableMaterials(prev => prev.map(mat => mat.id === id ? updatedMaterial : mat));
      return updatedMaterial;
    } catch (err: any) {
      setError(err.message || 'Failed to update non-consumable material');
      throw err;
    }
  }, []);

  const deleteNonConsumableMaterial = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await materialsService.deleteNonConsumableMaterial(id);
      setNonConsumableMaterials(prev => prev.filter(mat => mat.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete non-consumable material');
      throw err;
    }
  }, []);

  const getNonConsumableMaterialsByAmbulanceId = useCallback((ambulanceId: string): NonConsumableMaterial[] => {
    return nonConsumableMaterials.filter(mat => mat.ambulanceId === ambulanceId);
  }, [nonConsumableMaterials]);

  // Bulk Operations
  const importMaterials = useCallback(async (file: File, ambulanceId: string) => {
    try {
      setError(null);
      const result = await materialsService.importMaterials(file, ambulanceId);
      // Refresh materials after import
      await refreshMaterials();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to import materials');
      throw err;
    }
  }, [refreshMaterials]);

  const exportMaterials = useCallback(async (ambulanceId?: string): Promise<Blob> => {
    try {
      setError(null);
      return await materialsService.exportMaterials(ambulanceId);
    } catch (err: any) {
      setError(err.message || 'Failed to export materials');
      throw err;
    }
  }, []);

  // Alerts
  const getExpiringMaterials = useCallback(async (days: number = 7): Promise<ConsumableMaterial[]> => {
    try {
      setError(null);
      return await materialsService.getExpiringMaterials(days);
    } catch (err: any) {
      setError(err.message || 'Failed to get expiring materials');
      throw err;
    }
  }, []);

  const getLowStockMaterials = useCallback(async () => {
    try {
      setError(null);
      return await materialsService.getLowStockMaterials();
    } catch (err: any) {
      setError(err.message || 'Failed to get low stock materials');
      throw err;
    }
  }, []);

  return {
    consumableMaterials,
    nonConsumableMaterials,
    loading,
    error,
    createConsumableMaterial,
    updateConsumableMaterial,
    deleteConsumableMaterial,
    getConsumableMaterialsByAmbulanceId,
    createNonConsumableMaterial,
    updateNonConsumableMaterial,
    deleteNonConsumableMaterial,
    getNonConsumableMaterialsByAmbulanceId,
    importMaterials,
    exportMaterials,
    getExpiringMaterials,
    getLowStockMaterials,
    refreshMaterials,
  };
}
