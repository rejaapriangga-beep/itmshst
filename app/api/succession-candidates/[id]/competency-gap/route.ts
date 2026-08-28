import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { compPool, gapNormalizeJobName, gapJaccardSimilarity } from '@/lib/external-db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const candidate = await prisma.successionCandidate.findUnique({
    where: { id },
    include: { position: true },
  })
  if (!candidate) return NextResponse.json({ error: 'Kandidat tidak ditemukan' }, { status: 404 })

  const targetName = candidate.position.positionName
  if (!targetName) {
    return NextResponse.json({ available: false, reason: 'Posisi target tidak memiliki nama jabatan.' })
  }

  const jabatanList = await compPool.query(`SELECT id, kode, nama FROM "Jabatan"`)
  const targetTokens = gapNormalizeJobName(targetName)

  let bestMatch: any = null
  let bestSim = 0
  for (const j of jabatanList.rows) {
    const sim = gapJaccardSimilarity(targetTokens, gapNormalizeJobName(j.nama))
    if (sim > bestSim) {
      bestSim = sim
      bestMatch = j
    }
  }

  if (!bestMatch || bestSim < 0.3) {
    return NextResponse.json({
      available: false,
      reason: 'Tidak ditemukan jabatan sejenis di MyCompetency untuk pembanding kompetensi.',
    })
  }

  const reqResult = await compPool.query(
    `
    SELECT jk."kompetensiId", jk."levelMinimal", jk.prioritas, k.nama AS kompetensi_nama, k.kluster
    FROM "JabatanKompetensi" jk
    JOIN "Kompetensi" k ON k.id = jk."kompetensiId"
    WHERE jk."jabatanId" = $1
    `,
    [bestMatch.id]
  )

  const karyawanResult = await compPool.query(
    `SELECT id FROM "Karyawan" WHERE nipp = $1`,
    [candidate.candidateNip]
  )
  const karyawan = karyawanResult.rows[0]

  const actualMap = new Map<string, number>()
  if (karyawan) {
    const actualResult = await compPool.query(
      `SELECT "kompetensiId", "levelAktual" FROM "KaryawanKompetensi" WHERE "karyawanId" = $1`,
      [karyawan.id]
    )
    actualResult.rows.forEach((r) => actualMap.set(r.kompetensiId, r.levelAktual))
  }

  const total = reqResult.rows.length
  let matched = 0
  let highPriorityGaps = 0

  const details = reqResult.rows.map((r) => {
    const actual = actualMap.has(r.kompetensiId) ? actualMap.get(r.kompetensiId)! : 0
    const met = actual >= r.levelMinimal
    if (met) matched++
    if (!met && r.prioritas === 'HIGH') highPriorityGaps++
    return {
      kompetensi_nama: r.kompetensi_nama,
      kluster: r.kluster,
      required_level: r.levelMinimal,
      actual_level: actual,
      prioritas: r.prioritas,
      met,
    }
  })

  const overallMatch = total > 0 ? Math.round((matched / total) * 100) : 0

  return NextResponse.json({
    available: true,
    matched_jabatan: bestMatch.nama,
    match_similarity: Math.round(bestSim * 100),
    has_karyawan_data: !!karyawan,
    overall_match: overallMatch,
    competency_gap: 100 - overallMatch,
    high_priority_gaps: highPriorityGaps,
    matched_count: matched,
    gap_count: total - matched,
    total_competencies: total,
    details,
  })
}
