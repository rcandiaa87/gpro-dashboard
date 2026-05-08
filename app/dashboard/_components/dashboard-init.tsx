'use client';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useDashboardStore } from '@/lib/store';

export function DashboardInit() {
  const setIdm = useDashboardStore((s) => s.setIdm);

  useEffect(() => {
    const idmFromUrl = new URLSearchParams(window.location.search).get('idm');
    if (idmFromUrl && Number(idmFromUrl) > 0) {
      setIdm(Number(idmFromUrl));
    } else {
      toast.error('No se recibió un usuario válido. Accedé desde el menú principal.');
    }
  }, [setIdm]);

  return null;
}
