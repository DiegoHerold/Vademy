import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'API em manutenção - estrutura hierárquica em implementação' },
    { status: 503 }
  )
}