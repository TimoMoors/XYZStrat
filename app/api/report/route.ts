import { NextResponse } from 'next/server';
import { getLatestReport } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = await getLatestReport();
    if (!report) {
      return NextResponse.json({ error: 'No report available yet. Trigger an analysis first.' }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch (error) {
    console.error('Failed to fetch report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}
