'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Trophy, Car, User, Flag, Menu, X,
  ChevronRight, Gauge, Handshake
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/races', label: 'Carreras', icon: Flag },
  { href: '/dashboard/pilot', label: 'Piloto', icon: User },
  { href: '/dashboard/vehicle', label: 'Vehículo', icon: Car },
  { href: '/dashboard/standings', label: 'Clasificación', icon: Trophy },
  { href: '/dashboard/tracks', label: 'Circuitos', icon: Gauge },
  { href: '/dashboard/sponsors', label: 'Sponsors', icon: Handshake },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? '';
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
        Saltar al contenido
      </a>

      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menú de navegación"
        aria-expanded={open}
        aria-controls="sidebar-nav"
        className="fixed top-4 left-4 z-50 lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-800 rounded-lg text-white shadow-lg transition-colors hover:bg-slate-700"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Cerrar menú"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(false); }}
        />
      )}

      <aside
        id="sidebar-nav"
        aria-label="Barra lateral de navegación"
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/50 z-50 transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Flag className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-display font-bold text-white">GPRO</h2>
              <p className="text-xs text-blue-400">Dragons</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú de navegación"
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white transition-colors rounded-lg"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Navegación principal" className="p-3 space-y-1 mt-2">
          {navItems?.map((item: any) => {
            const isActive = pathname === item?.href || (item?.href !== '/dashboard' && pathname?.startsWith(item?.href));
            return (
              <Link
                key={item?.href}
                href={item?.href ?? '#'}
                onClick={() => setOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {item?.icon && <item.icon className="w-4 h-4" aria-hidden="true" />}
                <span>{item?.label ?? ''}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-blue-400" aria-hidden="true">
              D
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">Dragons</p>
              <p className="text-xs text-slate-400 truncate">GPRO Racing</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
