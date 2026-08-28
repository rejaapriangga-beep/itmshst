// Migrasi data dummy Succession Planning dari career_db -> itms_db
// Jalankan sekali: node migrate-dummy-succession.js

const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
require('dotenv/config')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const careerPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'career_db',
  user: 'dev_user',
  password: 'HSTdev2026',
})

const POSITIONS = [
  { org_position_id: 54, is_critical: true, criticality_reason: 'Test kritikal' },
  { org_position_id: 35, is_critical: true, criticality_reason: null },
  { org_position_id: 15, is_critical: true, criticality_reason: null },
  { org_position_id: 42, is_critical: true, criticality_reason: null },
  { org_position_id: 41, is_critical: true, criticality_reason: null },
]

const CANDIDATES = [
  { org_position_id: 54, candidate_nip: '43190', candidate_nama: 'AGUS SETIJONO', candidate_current_position: 'Vice President of General Affair', readiness_level: 'SIAP_1_2_TAHUN', notes: 'Test kandidat', added_by: '61612@kai.id', is_designated_successor: false, in_comparison: false },
  { org_position_id: 35, candidate_nip: '90007', candidate_nama: 'HENDRA GUNAWAN', candidate_current_position: 'VP of Regional Operations', readiness_level: 'SIAP_SEKARANG', notes: null, added_by: 'system-dummy', is_designated_successor: false, in_comparison: false },
  { org_position_id: 35, candidate_nip: '90001', candidate_nama: 'BUDI SANTOSO', candidate_current_position: 'VP of Building Maintenance', readiness_level: 'SIAP_SEKARANG', notes: null, added_by: 'system-dummy', is_designated_successor: false, in_comparison: false },
  { org_position_id: 35, candidate_nip: '90004', candidate_nama: 'DEWI KARTIKA', candidate_current_position: 'Manager of Building Operations', readiness_level: 'SIAP_SEKARANG', notes: null, added_by: 'system-dummy', is_designated_successor: true, in_comparison: false },
  { org_position_id: 35, candidate_nip: '90002', candidate_nama: 'SITI RAHAYU', candidate_current_position: 'VP of Facility Management', readiness_level: 'SIAP_1_2_TAHUN', notes: null, added_by: 'system-dummy', is_designated_successor: false, in_comparison: false },
  { org_position_id: 35, candidate_nip: '90003', candidate_nama: 'AHMAD FAUZI', candidate_current_position: 'Manager of Property Development', readiness_level: 'SIAP_1_2_TAHUN', notes: null, added_by: 'system-dummy', is_designated_successor: false, in_comparison: false },
  { org_position_id: 35, candidate_nip: '90005', candidate_nama: 'RIZKI PRATAMA', candidate_current_position: 'Senior Manager of Asset Management', readiness_level: 'SIAP_3_5_TAHUN', notes: null, added_by: 'system-dummy', is_designated_successor: false, in_comparison: false },
  { org_position_id: 35, candidate_nip: '90006', candidate_nama: 'LINDA WIJAYA', candidate_current_position: 'Manager of Building Safety', readiness_level: 'SIAP_1_2_TAHUN', notes: null, added_by: 'system-dummy', is_designated_successor: false, in_comparison: false },
  { org_position_id: 35, candidate_nip: '90008', candidate_nama: 'MAYA SARI', candidate_current_position: 'Manager of Building Compliance', readiness_level: 'SIAP_3_5_TAHUN', notes: null, added_by: 'system-dummy', is_designated_successor: false, in_comparison: false },
  { org_position_id: 35, candidate_nip: '90009', candidate_nama: 'YUDI PRASETYO', candidate_current_position: 'Senior Manager of Building Development', readiness_level: 'SIAP_1_2_TAHUN', notes: null, added_by: 'system-dummy', is_designated_successor: false, in_comparison: false },
  { org_position_id: 35, candidate_nip: '90010', candidate_nama: 'FITRI HANDAYANI', candidate_current_position: 'Manager of Building Projects', readiness_level: 'SIAP_SEKARANG', notes: null, added_by: 'system-dummy', is_designated_successor: false, in_comparison: false },
]

async function main() {
  const idMap = {}

  for (const p of POSITIONS) {
    const res = await careerPool.query('SELECT nama_jabatan FROM org_positions WHERE id = $1', [p.org_position_id])
    const namaJabatan = res.rows[0]?.nama_jabatan || `Posisi ${p.org_position_id}`

    const created = await prisma.successionPosition.upsert({
      where: { careerPositionId: p.org_position_id },
      update: { isCritical: p.is_critical, criticalityReason: p.criticality_reason },
      create: {
        careerPositionId: p.org_position_id,
        positionCode: `CP-${p.org_position_id}`,
        positionName: namaJabatan,
        isCritical: p.is_critical,
        criticalityReason: p.criticality_reason,
      },
    })
    idMap[p.org_position_id] = created.id
    console.log(`✓ Posisi ${p.org_position_id} (${namaJabatan}) -> ${created.id}`)
  }

  for (const c of CANDIDATES) {
    const positionId = idMap[c.org_position_id]
    if (!positionId) {
      console.log(`✗ Skip ${c.candidate_nama}, posisi ${c.org_position_id} tidak ditemukan`)
      continue
    }
    try {
      await prisma.successionCandidate.upsert({
        where: { positionId_candidateNip: { positionId, candidateNip: c.candidate_nip } },
        update: {},
        create: {
          positionId,
          candidateNip: c.candidate_nip,
          candidateName: c.candidate_nama,
          candidateCurrentPosition: c.candidate_current_position,
          readiness: c.readiness_level,
          inComparison: c.in_comparison,
          status: c.is_designated_successor ? 'APPOINTED' : 'PROPOSED',
          notes: c.notes,
          proposedBy: c.added_by,
        },
      })
      console.log(`✓ Kandidat ${c.candidate_nama} -> posisi ${positionId}`)
    } catch (e) {
      console.log(`✗ Gagal ${c.candidate_nama}: ${e.message}`)
    }
  }

  console.log('Selesai.')
  await careerPool.end()
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
