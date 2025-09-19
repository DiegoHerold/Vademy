import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'API em manutenção - estrutura hierárquica em implementação' },
    { status: 503 }
  )
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'API em manutenção - estrutura hierárquica em implementação' },
    { status: 503 }
  )
}