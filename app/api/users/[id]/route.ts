import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentRole = (session.user as any)?.role
  if (currentRole !== 'SUPERADMIN' && currentRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak punya akses' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}
  if (body.fullName !== undefined) data.fullName = body.fullName
  if (body.role !== undefined) data.role = body.role
  if (body.jobPosition !== undefined) data.jobPosition = body.jobPosition || null
  if (body.department !== undefined) data.department = body.department || null
  if (body.password) data.password = await bcrypt.hash(body.password, 12)

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, nip: true, email: true, fullName: true, role: true, jobPosition: true, department: true, createdAt: true,
      },
    })
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

  const currentRole = (session.user as any)?.role
  if (currentRole !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Hanya superadmin yang bisa menghapus user' }, { status: 403 })
  }

  const { id } = await params

  if (id === (session.user as any)?.id) {
    return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
