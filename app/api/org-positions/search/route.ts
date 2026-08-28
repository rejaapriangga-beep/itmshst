import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { careerPool } from '@/lib/external-db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = req.nextUrl.searchParams.get('q') || ''
  if (q.trim().length < 2) return NextResponse.json([])

  const result = await careerPool.query(
    `
    SELECT
      p.id,
      p.nama_jabatan,
      p.jumlah_slot,
      p.tipe_jabatan,
      u.nama_unit,
      u.perusahaan,
      (SELECT COUNT(*) FROM org_position_holders h WHERE h.org_position_id = p.id AND h.status = 'aktif') AS filled_count,
      (SELECT string_agg(h.nama_pegawai, ', ') FROM org_position_holders h WHERE h.org_position_id = p.id AND h.status = 'aktif') AS holder_names
    FROM org_positions p
    JOIN org_units u ON u.id = p.org_unit_id
    WHERE p.nama_jabatan ILIKE $1 OR u.nama_unit ILIKE $1
    ORDER BY p.nama_jabatan
    LIMIT 20
    `,
    [`%${q}%`]
  )

  return NextResponse.json(result.rows)
}
