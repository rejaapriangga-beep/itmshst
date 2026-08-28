import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nip: true,
      email: true,
      fullName: true,
      role: true,
      jobPosition: true,
      department: true,
      createdAt: true,
    },
  })

  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentRole = (session.user as any)?.role
  if (currentRole !== 'SUPERADMIN' && currentRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak punya akses' }, { status: 403 })
  }

  const body = await req.json()
  if (!body.nip || !body.email || !body.password || !body.fullName) {
    return NextResponse.json({ error: 'NIP, email, password, dan nama wajib diisi' }, { status: 400 })
  }

  try {
    const hashed = await bcrypt.hash(body.password, 12)
    const created = await prisma.user.create({
      data: {
        nip: body.nip,
        email: body.email,
        password: hashed,
        fullName: body.fullName,
        role: body.role || 'PEKERJA',
        jobPosition: body.jobPosition || null,
        department: body.department || null,
      },
      select: {
        id: true, nip: true, email: true, fullName: true, role: true, jobPosition: true, department: true, createdAt: true,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'NIP atau email sudah terdaftar' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 })
  }
}
