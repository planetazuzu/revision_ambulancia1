"use client";

import { MOCK_MODE } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Database, Server } from 'lucide-react';

export function MockModeIndicator() {
  if (!MOCK_MODE) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge variant="secondary" className="flex items-center gap-2 bg-yellow-100 text-yellow-800 border-yellow-200">
        <Database className="h-3 w-3" />
        Modo Mock
      </Badge>
    </div>
  );
}

export function BackendModeIndicator() {
  if (MOCK_MODE) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge variant="secondary" className="flex items-center gap-2 bg-green-100 text-green-800 border-green-200">
        <Server className="h-3 w-3" />
        Backend Real
      </Badge>
    </div>
  );
}
