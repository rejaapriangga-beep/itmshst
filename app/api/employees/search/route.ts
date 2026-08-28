import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { careerPool } from '@/lib/external-db'

// Catatan scope: pencarian pegawai saat ini terbatas pada org_position_holders
// (pegawai yang tercatat sebagai pemegang suatu jabatan di struktur career_db).
// Ini belum mencakup seluruh basis data pegawai perusahaan.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = req.nextUrl.searchParams.get('q') || ''
  if (q.trim().length < 2) return NextResponse.json([])

  const result = await careerPool.query(
    `
    SELECT DISTINCT ON (h.nip)
      h.nip,
      h.nama_pegawai,
      p.nama_jabatan AS current_position
    FROM org_position_holders h
    JOIN org_positions p ON p.id = h.org_position_id
    WHERE h.status = 'aktif' AND (h.nama_pegawai ILIKE $1 OR h.nip ILIKE $1)
    ORDER BY h.nip, h.updated_at DESC
    LIMIT 15
    `,
    [`%${q}%`]
  )

  return NextResponse.json(result.rows)
}
