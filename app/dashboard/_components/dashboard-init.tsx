'use client';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useDashboardStore } from '@/lib/store';

export function DashboardInit() {
  const setIdm = useDashboardStore((s) => s.setIdm);

  useEffect(() => {
    try {
      const parentSesion = (window.parent as any)?.sesion;
      const idmFromParent = Number(parentSesion?.[0]?.idm);
      if (idmFromParent > 0) { setIdm(idmFromParent); return; }
    } catch {}

    const idmFromUrl = Number(new URLSearchParams(window.location.search).get('idm'));
    if (idmFromUrl > 0) { setIdm(idmFromUrl); return; }

    toast.error('No se recibió un usuario válido. Accedé desde el menú principal.');
  }, [setIdm]);

  return null;
}
