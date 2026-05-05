'use client';
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

interface UserSelectorProps {
  selectedIdm: number;
  onIdmChange: (idm: number) => void;
}

export function UserSelector({ selectedIdm, onIdmChange }: UserSelectorProps) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/gpro/users')
      .then((r) => r.json())
      .then((data: any) => {
        const u = Array.isArray(data) ? data : [];
        setUsers(u);
        if (u?.length > 0 && !selectedIdm) {
          onIdmChange(u[0]?.usr_idm);
        }
      })
      .catch(() => setUsers([]));
  }, []);

  return (
    <div className="flex items-center gap-3">
      <Users className="w-4 h-4 text-blue-400" />
      <select
        value={selectedIdm}
        onChange={(e) => onIdmChange(Number(e.target.value))}
        className="bg-slate-800 border border-slate-600 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value={0}>Seleccionar Manager</option>
        {(users ?? [])?.map?.((u: any) => (
          <option key={u?.usr_idm} value={u?.usr_idm}>
            {u?.usr_nick} ({u?.usr_nombre ?? ''} {u?.usr_apellido ?? ''})
          </option>
        )) ?? []}
      </select>
    </div>
  );
}
