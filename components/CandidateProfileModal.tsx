'use client'

import { X } from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { computeJobFit } from './SuccessionModal'
import type { Position } from './JobTargetBoard'

const READINESS_LABEL: Record<string, string> = {
  SIAP_SEKARANG: '🟢 Siap Sekarang',
  SIAP_1_2_TAHUN: '🟡 1-2 Tahun',
  SIAP_3_5_TAHUN: '🟠 3-5 Tahun',
}

function CustomAngleTick(props: any) {
  const { x, y, payload, textAnchor } = props
  const label: string = payload.value
  const match = label.match(/^(.*?)\s*\((.*)\)$/)
  const main = match ? match[1].trim() : label
  const sub = match ? match[2].trim() : null

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor={textAnchor} fontSize={11.5} fontWeight={700} fill="#1e293b">
        {main}
      </text>
      {sub && (
        <text textAnchor={textAnchor} dy={14} fontSize={9.5} fontWeight={500} fill="#64748b">
          ({sub})
        </text>
      )}
    </g>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-500">
        {children}
      </span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

export default function CandidateProfileModal({
  candidate,
  gap,
  position,
  onClose,
}: {
  candidate: any
  gap: any
  position: Position
  onClose: () => void
}) {
  const jobFit = computeJobFit(candidate.talentScore, gap)

  const details: any[] = gap?.available ? gap.details || [] : []
  const leadershipDetails = details.filter((d) => d.kluster === 'LEADERSHIP')
  const otherDetails = details.filter((d) => d.kluster !== 'LEADERSHIP')

  const radarData = leadershipDetails.map((d) => ({
    kompetensi: d.kompetensi_nama,
    Aktual: d.actual_level,
    Butuh: d.required_level,
  }))

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">{candidate.candidateName}</h2>
            <p className="text-xs text-slate-500">{candidate.candidateCurrentPosition || '-'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 text-sm">
          <Row label="NIP" value={candidate.candidateNip} />
          <Row label="Posisi Saat Ini" value={candidate.candidateCurrentPosition || '-'} />
          <Row label="Jabatan Tujuan Suksesi" value={position.positionName} highlight />
          <Row
            label="Talent Score"
            value={candidate.talentScore !== null ? `${candidate.talentScore} (${candidate.talentKategori || '-'})` : 'Belum ada data'}
          />
          <Row label="% Job Fit" value={jobFit !== null ? `${jobFit}%` : '-'} />
          <Row label="Readiness" value={READINESS_LABEL[candidate.readiness] || candidate.readiness} />
          <Row label="Status" value={candidate.status === 'APPOINTED' ? '★ Suksesor Resmi' : 'Kandidat'} />

          {!gap?.available && (
            <p className="mt-4 text-xs text-slate-400">{gap?.reason || 'Data kompetensi tidak tersedia'}</p>
          )}

          {gap?.available && (
            <>
              {leadershipDetails.length > 0 && (
                <div className="mb-6 mt-5">
                  <SectionTitle>🕸️ Kompetensi Leadership — Komparasi Pemenuhan</SectionTitle>
                  <div className="rounded-lg border border-slate-200 bg-gradient-to-b from-indigo-50/40 to-white p-3">
                    <ResponsiveContainer width="100%" height={460}>
                      <RadarChart data={radarData} outerRadius="55%">
                        <defs>
                          <radialGradient id="aktualGradient" cx="50%" cy="50%" r="65%">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.55} />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity={0.12} />
                          </radialGradient>
                          <radialGradient id="butuhGradient" cx="50%" cy="50%" r="65%">
                            <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.04} />
                          </radialGradient>
                        </defs>
                        <PolarGrid stroke="#CBD5E1" />
                        <PolarAngleAxis dataKey="kompetensi" tick={<CustomAngleTick />} />
                        <PolarRadiusAxis
                          angle={90 + 360 / Math.max(radarData.length, 1) / 2}
                          domain={[0, 5]}
                          tickCount={6}
                          tick={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E6F0' }}
                          labelStyle={{ fontWeight: 700, color: '#1e293b' }}
                        />
                        <Radar
                          name="Level Dibutuhkan"
                          dataKey="Butuh"
                          stroke="#F43F5E"
                          fill="url(#butuhGradient)"
                          strokeWidth={2.5}
                          strokeDasharray="7 5"
                          dot={{ r: 3.5, fill: '#F43F5E', strokeWidth: 1.5, stroke: '#fff' }}
                        />
                        <Radar
                          name="Level Aktual"
                          dataKey="Aktual"
                          stroke="#4F46E5"
                          fill="url(#aktualGradient)"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#4F46E5', strokeWidth: 1.5, stroke: '#fff' }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={32}
                          wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 8 }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {otherDetails.length > 0 && (
                <div>
                  <SectionTitle>📊 Kompetensi Non Leadership</SectionTitle>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-left text-[10px] uppercase text-slate-400">
                        <th className="px-2 py-1.5">Kompetensi</th>
                        <th className="px-2 py-1.5">Kluster</th>
                        <th className="px-2 py-1.5">Butuh</th>
                        <th className="px-2 py-1.5">Aktual</th>
                        <th className="px-2 py-1.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otherDetails.map((d, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="px-2 py-1.5 text-slate-700">{d.kompetensi_nama}</td>
                          <td className="px-2 py-1.5 text-slate-400">{d.kluster}</td>
                          <td className="px-2 py-1.5 text-slate-700">{d.required_level}</td>
                          <td className="px-2 py-1.5 text-slate-700">{d.actual_level}</td>
                          <td className={`px-2 py-1.5 font-medium ${d.met ? 'text-emerald-600' : 'text-red-600'}`}>
                            {d.met ? '✓ Terpenuhi' : '✕ Gap'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-blue-700' : 'text-slate-800'}`}>{value}</span>
    </div>
  )
}
