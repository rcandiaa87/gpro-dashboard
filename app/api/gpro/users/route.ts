export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryGpro } from '@/lib/gpro-db';

export async function GET() {
  try {
    const rows = await queryGpro(
      'SELECT usr_id, usr_nick, usr_nombre, usr_apellido, usr_idm FROM usuario WHERE usr_idm IS NOT NULL ORDER BY usr_nick'
    );
    return NextResponse.json(rows ?? []);
  } catch (e: any) {
    console.error('Users error:', e?.message);
    return NextResponse.json([], { status: 500 });
  }
}
