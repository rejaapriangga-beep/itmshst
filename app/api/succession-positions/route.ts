import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { careerPool } from '@/lib/external-db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const positions = await prisma.successionPosition.findMany({
    orderBy: { createdAt: 'desc' },
    include: { candidates: true },
  })

  const linkedIds = positions
    .map((p) => p.careerPositionId)
    .filter((id): id is number => id !== null)

  let careerMap = new Map<number, any>()
  if (linkedIds.length > 0) {
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
      WHERE p.id = ANY($1::int[])
      `,
      [linkedIds]
    )
    careerMap = new Map(result.rows.map((r) => [r.id, r]))
  }

  const shaped = positions.map((p) => {
    const career = p.careerPositionId ? careerMap.get(p.careerPositionId) : null
    const jumlahSlot = career ? Number(career.jumlah_slot) : 1
    const filledCount = career ? Number(career.filled_count) : (p.isVacant ? 0 : 1)

    return {
      id: p.id,
      positionCode: p.positionCode,
      positionName: career ? career.nama_jabatan : p.positionName,
      unit: career ? `${career.nama_unit}${career.perusahaan ? ' · ' + career.perusahaan : ''}` : p.unit,
      tipeJabatan: career ? career.tipe_jabatan : p.jobFamily,
      holderNames: career ? career.holder_names : p.incumbentName,
      jumlahSlot,
      filledCount,
      isVacant: filledCount < jumlahSlot,
      isCritical: p.isCritical,
      criticalityReason: p.criticalityReason,
      tugasPokokFungsi: p.tugasPokokFungsi,
      successorCount: p.candidates.length,
      formalSuccessorCount: p.candidates.filter((c) => c.status === 'APPOINTED').length,
    }
  })

  return NextResponse.json(shaped)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Mode 1: link ke posisi career_db yang sudah ada
  if (body.careerPositionId) {
    const careerId = Number(body.careerPositionId)

    const existing = await prisma.successionPosition.findUnique({
      where: { careerPositionId: careerId },
    })
    if (existing) {
      // Sudah pernah ditandai — cukup update kritikal & alasan
      const updated = await prisma.successionPosition.update({
        where: { id: existing.id },
        data: {
          isCritical: true,
          criticalityReason: body.criticalityReason || existing.criticalityReason,
        },
      })
      return NextResponse.json(updated)
    }

    const detail = await careerPool.query(
      `SELECT p.nama_jabatan, u.nama_unit FROM org_positions p JOIN org_units u ON u.id = p.org_unit_id WHERE p.id = $1`,
      [careerId]
    )
    const row = detail.rows[0]
    if (!row) return NextResponse.json({ error: 'Posisi tidak ditemukan di career_db' }, { status: 404 })

    const created = await prisma.successionPosition.create({
      data: {
        careerPositionId: careerId,
        positionCode: `CP-${careerId}`,
        positionName: row.nama_jabatan,
        unit: row.nama_unit,
        isCritical: true,
        criticalityReason: body.criticalityReason || null,
      },
    })
    return NextResponse.json(created, { status: 201 })
  }

  // Mode 2: posisi manual (tanpa link career_db)
  if (!body.positionCode || !body.positionName) {
    return NextResponse.json({ error: 'Kode dan nama jabatan wajib diisi' }, { status: 400 })
  }

  try {
    const created = await prisma.successionPosition.create({
      data: {
        positionCode: body.positionCode,
        positionName: body.positionName,
        jobFamily: body.jobFamily || null,
        unit: body.unit || null,
        grade: body.grade || null,
        isVacant: !!body.isVacant,
        isCritical: !!body.isCritical,
        criticalityReason: body.criticalityReason || null,
        incumbentNip: body.incumbentNip || null,
        incumbentName: body.incumbentName || null,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Kode jabatan sudah ada' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 })
  }
}
