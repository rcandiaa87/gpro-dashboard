export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryGpro } from '@/lib/gpro-db';
import { apiError } from '@/lib/api-error';
import type { UsuarioRow } from '@/lib/gpro-types';

export async function GET() {
  try {
    const rows = await queryGpro<UsuarioRow>(
      'SELECT usr_id, usr_nick, usr_nombre, usr_apellido, usr_idm FROM usuario WHERE usr_idm IS NOT NULL ORDER BY usr_nick'
    );
    return NextResponse.json(rows ?? []);
  } catch (e: unknown) {
    return apiError(500, 'Error al cargar usuarios', e);
  }
}
