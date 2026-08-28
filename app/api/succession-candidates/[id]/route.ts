import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}
  if (body.readiness !== undefined) data.readiness = body.readiness
  if (body.inComparison !== undefined) data.inComparison = !!body.inComparison
  if (body.isDesignatedSuccessor !== undefined) {
    data.status = body.isDesignatedSuccessor ? 'APPOINTED' : 'PROPOSED'
    data.decidedAt = body.isDesignatedSuccessor ? new Date() : null
  }

  try {
    const updated = await prisma.successionCandidate.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.successionCandidate.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
