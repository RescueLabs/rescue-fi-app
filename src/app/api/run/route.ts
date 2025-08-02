import { NextRequest, NextResponse } from 'next/server';

import signStuff from '../../../../signstuff';

export async function GET(request: NextRequest) {
  const result = await signStuff();
  return NextResponse.json(result);
}
