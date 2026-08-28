import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { careerPool } from '@/lib/external-db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const positionId = req.nextUrl.searchParams.get('positionId')
  if (!positionId) return NextResponse.json({ error: 'positionId wajib diisi' }, { status: 400 })

  const candidates = await prisma.successionCandidate.findMany({
    where: { positionId },
    orderBy: { createdAt: 'asc' },
  })

  const nips = candidates.map((c) => c.candidateNip)
  let talentMap = new Map<string, any>()
  if (nips.length > 0) {
    const result = await careerPool.query(
      `SELECT nip, talent_score, kategori_talent FROM talent_scores WHERE nip = ANY($1::text[])`,
      [nips]
    )
    talentMap = new Map(result.rows.map((r) => [r.nip, r]))
  }

  const shaped = candidates.map((c) => ({
    id: c.id,
    candidateNip: c.candidateNip,
    candidateName: c.candidateName,
    candidateCurrentPosition: c.candidateCurrentPosition,
    readiness: c.readiness,
    inComparison: c.inComparison,
    status: c.status,
    talentScore: talentMap.get(c.candidateNip)?.talent_score ?? null,
    talentKategori: talentMap.get(c.candidateNip)?.kategori_talent ?? null,
  }))

  return NextResponse.json(shaped)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!body.positionId || !body.candidateNip || !body.candidateName) {
    return NextResponse.json({ error: 'positionId, candidateNip, candidateName wajib diisi' }, { status: 400 })
  }

  try {
    const created = await prisma.successionCandidate.create({
      data: {
        positionId: body.positionId,
        candidateNip: body.candidateNip,
        candidateName: body.candidateName,
        candidateCurrentPosition: body.candidateCurrentPosition || null,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Pegawai ini sudah menjadi kandidat untuk posisi ini' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Gagal menambah kandidat' }, { status: 500 })
  }
}
