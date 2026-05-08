import { Sidebar } from '@/components/sidebar';
import { DashboardInit } from './_components/dashboard-init';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <DashboardInit />
      <main className="lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
