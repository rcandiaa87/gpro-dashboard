'use client';
import Link from 'next/link';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Algo salió mal</h2>
        <p className="text-slate-400 text-sm">Ocurrió un error inesperado en la aplicación.</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-600 transition-all"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
