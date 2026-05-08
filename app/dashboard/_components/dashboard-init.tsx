'use client';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useDashboardStore } from '@/lib/store';

export function DashboardInit() {
  const idm = useDashboardStore((s) => s.idm);
  const setIdm = useDashboardStore((s) => s.setIdm);

  useEffect(() => {
    const idmFromUrl = new URLSearchParams(window.location.search).get('idm');
    if (idmFromUrl && Number(idmFromUrl) > 0) {
      setIdm(Number(idmFromUrl));
      return;
    }
    if (idm !== 0) return;
    fetch('/api/gpro/users')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: any) => { if (d?.[0]?.usr_idm) setIdm(d[0].usr_idm); })
      .catch(() => { toast.error('No se pudo cargar la lista de managers.'); });
  }, [idm, setIdm]);

  return null;
}
