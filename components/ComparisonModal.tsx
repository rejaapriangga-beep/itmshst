'use client'

import { X } from 'lucide-react'
import { computeJobFit } from './SuccessionModal'

const READINESS_LABEL: Record<string, string> = {
  SIAP_SEKARANG: '🟢 Siap Sekarang',
  SIAP_1_2_TAHUN: '🟡 1-2 Tahun',
  SIAP_3_5_TAHUN: '🟠 3-5 Tahun',
}

export default function ComparisonModal({
  positionName,
  candidates,
  gaps,
  onDesignate,
  onClose,
}: {
  positionName: string
  candidates: any[]
  gaps: Record<string, any>
  onDesignate: (id: string, next: boolean) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">⚖️ Komparasi Kandidat</h2>
            <p className="text-xs text-slate-500">{positionName} — {candidates.length} kandidat dibandingkan</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto px-5 py-4">
          {candidates.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Belum ada kandidat yang ditandai "Masuk Daftar Komparasi". Centang tombol itu di kartu kandidat dulu.
            </p>
          ) : (
            <table className="w-full min-w-[900px] border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-left text-[10px] uppercase text-slate-400">
                  <th className="whitespace-nowrap px-3 py-2">Nama</th>
                  <th className="whitespace-nowrap px-3 py-2">Posisi Saat Ini</th>
                  <th className="whitespace-nowrap px-3 py-2">Talent Score</th>
                  <th className="whitespace-nowrap px-3 py-2">Kompetensi Match</th>
                  <th className="whitespace-nowrap px-3 py-2">Job Fit</th>
                  <th className="whitespace-nowrap px-3 py-2">Total Komp.</th>
                  <th className="whitespace-nowrap px-3 py-2">Terpenuhi</th>
                  <th className="whitespace-nowrap px-3 py-2">Gap</th>
                  <th className="whitespace-nowrap px-3 py-2">Prioritas Tinggi</th>
                  <th className="whitespace-nowrap px-3 py-2">Readiness</th>
                  <th className="whitespace-nowrap px-3 py-2">Status</th>
                  <th className="whitespace-nowrap px-3 py-2">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => {
                  const gap = gaps[c.id]
                  const jobFit = computeJobFit(c.talentScore, gap)
                  return (
                    <tr key={c.id} className="border-b border-slate-100">
                      <td className="whitespace-nowrap px-3 py-2 font-bold">{c.candidateName}</td>
                      <td className="whitespace-nowrap px-3 py-2">{c.candidateCurrentPosition || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-2">{c.talentScore ?? '-'}</td>
                      <td className="whitespace-nowrap px-3 py-2">{gap?.available ? `${gap.overall_match}%` : '-'}</td>
                      <td
                        className="whitespace-nowrap px-3 py-2 font-bold"
                        style={{ color: jobFit === null ? '#6B7280' : jobFit >= 85 ? '#166534' : jobFit >= 70 ? '#854D0E' : '#991B1B' }}
                      >
                        {jobFit !== null ? `${jobFit}%` : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">{gap?.available ? gap.total_competencies : '-'}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-emerald-600">{gap?.available ? gap.matched_count : '-'}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-red-600">{gap?.available ? gap.gap_count : '-'}</td>
                      <td className="whitespace-nowrap px-3 py-2">{gap?.available ? gap.high_priority_gaps : '-'}</td>
                      <td className="whitespace-nowrap px-3 py-2">{READINESS_LABEL[c.readiness] || c.readiness}</td>
                      <td className="whitespace-nowrap px-3 py-2">{c.status === 'APPOINTED' ? '★ Suksesor Resmi' : '-'}</td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <button
                          onClick={() => onDesignate(c.id, c.status !== 'APPOINTED')}
                          className={`rounded px-2.5 py-1.5 text-[10px] font-semibold ${
                            c.status === 'APPOINTED' ? 'border border-amber-400 bg-amber-100 text-amber-800' : 'bg-[#0F2A4A] text-white'
                          }`}
                        >
                          {c.status === 'APPOINTED' ? '★ Suksesor Resmi' : 'Tetapkan jadi Suksesor'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
