import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('[cron] Analysis failed:', data);
    return NextResponse.json({ error: data.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, ...data });
}
