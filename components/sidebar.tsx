'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Trophy, Car, User, Flag, Menu, X,
  ChevronRight, Gauge
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/races', label: 'Carreras', icon: Flag },
  { href: '/dashboard/pilot', label: 'Piloto', icon: User },
  { href: '/dashboard/vehicle', label: 'Vehículo', icon: Car },
  { href: '/dashboard/standings', label: 'Clasificación', icon: Trophy },
  { href: '/dashboard/tracks', label: 'Circuitos', icon: Gauge },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? '';

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-slate-800 rounded-lg text-white shadow-lg">
        <Menu className="w-5 h-5" />
      </button>

      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/50 z-50 transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-display font-bold text-white">GPRO</h2>
              <p className="text-xs text-blue-400">Blue Dragons</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 mt-2">
          {navItems?.map((item: any) => {
            const isActive = pathname === item?.href || (item?.href !== '/dashboard' && pathname?.startsWith(item?.href));
            return (
              <Link key={item?.href} href={item?.href ?? '#'} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}>
                {item?.icon && <item.icon className="w-4 h-4" />}
                <span>{item?.label ?? ''}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">
              B
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">Blue Dragons</p>
              <p className="text-xs text-slate-500 truncate">GPRO Racing</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
