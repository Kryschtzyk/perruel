import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: validate + write into Supabase via service key (Edge Function ideal)
  return NextResponse.json({ ok: true, received: !!body });
}

