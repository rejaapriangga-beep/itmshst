import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET() {
  const [totalPosisi, kritikal, totalKandidat, suksesorResmi, totalUser] = await Promise.all([
    prisma.successionPosition.count(),
    prisma.successionPosition.count({ where: { isCritical: true } }),
    prisma.successionCandidate.count(),
    prisma.successionCandidate.count({ where: { status: 'APPOINTED' } }),
    prisma.user.count(),
  ])

  const positionsWithCandidates = await prisma.successionPosition.count({
    where: { isCritical: true, candidates: { some: {} } },
  })
  const pct = kritikal > 0 ? Math.round((positionsWithCandidates / kritikal) * 1000) / 10 : 0

  return NextResponse.json(
    { totalPosisi, kritikal, totalKandidat, suksesorResmi, totalUser, pct },
    { headers: CORS_HEADERS }
  )
}
