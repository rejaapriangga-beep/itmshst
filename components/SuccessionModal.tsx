'use client'

import { useEffect, useState } from 'react'
import { X, Search, Scale } from 'lucide-react'
import type { Position } from './JobTargetBoard'
import CandidateProfileModal from './CandidateProfileModal'
import ComparisonModal from './ComparisonModal'

type Candidate = {
  id: string
  candidateNip: string
  candidateName: string
  candidateCurrentPosition: string | null
  readiness: 'SIAP_SEKARANG' | 'SIAP_1_2_TAHUN' | 'SIAP_3_5_TAHUN'
  inComparison: boolean
  status: string
  talentScore: number | null
  talentKategori: string | null
}

type Gap = {
  available: boolean
  reason?: string
  matched_jabatan?: string
  match_similarity?: number
  overall_match?: number
  gap_count?: number
  total_competencies?: number
  matched_count?: number
  high_priority_gaps?: number
  details?: any[]
}

const READINESS_LABEL: Record<string, string> = {
  SIAP_SEKARANG: '🟢 Siap Sekarang',
  SIAP_1_2_TAHUN: '🟡 1-2 Tahun',
  SIAP_3_5_TAHUN: '🟠 3-5 Tahun',
}

export function computeJobFit(talentScore: number | null, gap: Gap | undefined) {
  const matchVal = gap && gap.available ? gap.overall_match! : null
  if (talentScore === null && matchVal === null) return null
  if (talentScore === null) return Math.round(matchVal!)
  if (matchVal === null) return Math.round(talentScore)
  return Math.round((talentScore + matchVal) / 2)
}

export default function SuccessionModal({
  positionId,
  position,
  onClose,
  onCandidatesChanged,
}: {
  positionId: string
  position: Position
  onClose: () => void
  onCandidatesChanged: () => void
}) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [gaps, setGaps] = useState<Record<string, Gap>>({})
  const [loading, setLoading] = useState(true)

  const [tugasEditing, setTugasEditing] = useState(false)
  const [tugasText, setTugasText] = useState(position.tugasPokokFungsi || '')

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const [profileCandidateId, setProfileCandidateId] = useState<string | null>(null)
  const [comparisonOpen, setComparisonOpen] = useState(false)

  async function loadCandidates() {
    setLoading(true)
    const res = await fetch(`/api/succession-candidates?positionId=${positionId}`)
    const data: Candidate[] = res.ok ? await res.json() : []

    const gapEntries = await Promise.all(
      data.map(async (c) => {
        const gRes = await fetch(`/api/succession-candidates/${c.id}/competency-gap`)
        const g = gRes.ok ? await gRes.json() : { available: false }
        return [c.id, g] as const
      })
    )
    const gapMap = Object.fromEntries(gapEntries)

    const sorted = [...data].sort((a, b) => {
      const fitA = computeJobFit(a.talentScore, gapMap[a.id]) ?? -1
      const fitB = computeJobFit(b.talentScore, gapMap[b.id]) ?? -1
      return fitB - fitA
    })

    setCandidates(sorted)
    setGaps(gapMap)
    setLoading(false)
  }

  useEffect(() => {
    loadCandidates()
  }, [positionId])

  let searchDebounce: ReturnType<typeof setTimeout>
  function onSearchChange(value: string) {
    setSearchQuery(value)
    clearTimeout(searchDebounce)
    if (value.trim().length < 2) {
      setSearchResults([])
      return
    }
    searchDebounce = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/employees/search?q=${encodeURIComponent(value)}`)
      setSearchResults(res.ok ? await res.json() : [])
      setSearching(false)
    }, 350)
  }

  async function addCandidate(emp: { nip: string; nama_pegawai: string; current_position: string }) {
    await fetch('/api/succession-candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        positionId,
        candidateNip: emp.nip,
        candidateName: emp.nama_pegawai,
        candidateCurrentPosition: emp.current_position,
      }),
    })
    setSearchQuery('')
    setSearchResults([])
    await loadCandidates()
    onCandidatesChanged()
  }

  async function updateCandidate(id: string, body: Record<string, unknown>) {
    await fetch(`/api/succession-candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    await loadCandidates()
    onCandidatesChanged()
  }

  async function removeCandidate(id: string) {
    if (!confirm('Hapus kandidat ini dari daftar?')) return
    await fetch(`/api/succession-candidates/${id}`, { method: 'DELETE' })
    await loadCandidates()
    onCandidatesChanged()
  }

  async function saveTugasPokok() {
    await fetch(`/api/succession-positions/${positionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tugasPokokFungsi: tugasText }),
    })
    setTugasEditing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">{position.positionName}</h2>
            <p className="text-xs text-slate-500">{position.unit}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari & tambah pegawai..."
                className="w-56 rounded border border-slate-300 py-1.5 pl-8 pr-2 text-xs text-slate-800"
              />
              {searchResults.length > 0 && (
                <div className="absolute right-0 top-full z-10 mt-1 w-64 rounded border border-slate-200 bg-white p-1 shadow-lg">
                  {searching && <p className="px-2 py-1 text-xs text-slate-400">Mencari...</p>}
                  {searchResults.map((e) => (
                    <button
                      key={e.nip}
                      onClick={() => addCandidate(e)}
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-slate-50"
                    >
                      <span>
                        <span className="block font-medium text-slate-800">{e.nama_pegawai}</span>
                        <span className="text-slate-400">{e.current_position}</span>
                      </span>
                      <span className="shrink-0 rounded bg-blue-700 px-2 py-0.5 text-white">+ Tambah</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setComparisonOpen(true)}
              className="flex items-center gap-1 rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-[#0F2A4A]"
            >
              <Scale size={13} /> Lihat Komparasi
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Tugas Pokok */}
          <div className="mb-5 rounded border border-slate-200 bg-slate-50 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                📌 Tugas Pokok dan Fungsi
              </span>
              <button
                onClick={() => setTugasEditing(!tugasEditing)}
                className="text-xs font-semibold text-blue-700 underline"
              >
                {tugasEditing ? 'Batal' : 'Edit'}
              </button>
            </div>
            {tugasEditing ? (
              <>
                <textarea
                  value={tugasText}
                  onChange={(e) => setTugasText(e.target.value)}
                  rows={3}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
                />
                <div className="mt-2 text-right">
                  <button
                    onClick={saveTugasPokok}
                    className="rounded bg-[#0F2A4A] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Simpan
                  </button>
                </div>
              </>
            ) : (
              <p className="whitespace-pre-wrap text-sm text-slate-700">
                {position.tugasPokokFungsi || 'Belum diisi.'}
              </p>
            )}
          </div>

          {/* Kandidat */}
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            📋 Kandidat Terdaftar
          </p>

          {loading ? (
            <p className="text-sm text-slate-400">Memuat...</p>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada kandidat terdaftar.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.map((c) => {
                const gap = gaps[c.id]
                const jobFit = computeJobFit(c.talentScore, gap)
                const fitColor =
                  jobFit === null
                    ? { bg: 'bg-slate-100', text: 'text-slate-500' }
                    : jobFit >= 85
                    ? { bg: 'bg-emerald-50', text: 'text-emerald-700' }
                    : jobFit >= 70
                    ? { bg: 'bg-amber-50', text: 'text-amber-700' }
                    : { bg: 'bg-red-50', text: 'text-red-700' }

                return (
                  <div key={c.id} className="flex flex-col overflow-hidden rounded border border-slate-200">
                    <div className={`px-3 py-2 text-center text-xs font-extrabold ${fitColor.bg} ${fitColor.text}`}>
                      {jobFit !== null ? `🎯 ${jobFit}% JOB FIT` : 'Job Fit: -'}
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-[#0F2A4A]">
                          {c.candidateName.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-800">{c.candidateName}</p>
                          <p className="truncate text-[10px] text-slate-400">{c.candidateCurrentPosition || '-'}</p>
                        </div>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400">NIP: {c.candidateNip}</p>

                      <p className="mt-1 text-[9px] text-slate-400">
                        Talent Score: {c.talentScore ?? '-'} · Kompetensi Match: {gap?.available ? `${gap.overall_match}%` : '-'}
                      </p>

                      {gap?.available ? (
                        <div className="mt-2 grid grid-cols-3 gap-1.5">
                          <GapBox label="Total Komp." value={gap.total_competencies!} color="text-blue-700" />
                          <GapBox label="Terpenuhi" value={gap.matched_count!} color="text-emerald-700" />
                          <GapBox
                            label="Gap"
                            value={gap.gap_count!}
                            color={gap.gap_count === 0 ? 'text-emerald-700' : gap.gap_count! <= 3 ? 'text-amber-600' : 'text-red-600'}
                          />
                        </div>
                      ) : (
                        <p className="mt-2 text-[10px] italic text-slate-400">📊 {gap?.reason || 'Kompetensi tidak tersedia'}</p>
                      )}

                      <select
                        value={c.readiness}
                        onChange={(e) => updateCandidate(c.id, { readiness: e.target.value })}
                        className="mt-2 w-full rounded border border-slate-300 px-2 py-1 text-[11px]"
                      >
                        {Object.entries(READINESS_LABEL).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>

                      <div className="mt-2 flex flex-col gap-1">
                        <button
                          onClick={() => setProfileCandidateId(c.id)}
                          className="w-full rounded border border-slate-300 py-1.5 text-[10px] font-semibold text-slate-600"
                        >
                          👤 Lihat Profil
                        </button>
                        <button
                          onClick={() => updateCandidate(c.id, { isDesignatedSuccessor: c.status !== 'APPOINTED' })}
                          className={`w-full rounded py-1.5 text-[10px] font-semibold ${
                            c.status === 'APPOINTED' ? 'border border-amber-400 bg-amber-100 text-amber-800' : 'bg-[#0F2A4A] text-white'
                          }`}
                        >
                          {c.status === 'APPOINTED' ? '★ Suksesor Resmi' : 'Tetapkan jadi Suksesor'}
                        </button>
                        <button
                          onClick={() => updateCandidate(c.id, { inComparison: !c.inComparison })}
                          className={`w-full rounded py-1.5 text-[10px] font-semibold ${
                            c.inComparison ? 'border border-amber-400 bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {c.inComparison ? '✓ Dalam Komparasi' : 'Masuk Daftar Komparasi'}
                        </button>
                        <button
                          onClick={() => removeCandidate(c.id)}
                          className="w-full rounded bg-red-50 py-1.5 text-[10px] font-semibold text-red-600"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {profileCandidateId && (
        <CandidateProfileModal
          candidate={candidates.find((c) => c.id === profileCandidateId)!}
          gap={gaps[profileCandidateId]}
          position={position}
          onClose={() => setProfileCandidateId(null)}
        />
      )}

      {comparisonOpen && (
        <ComparisonModal
          positionName={position.positionName}
          candidates={candidates.filter((c) => c.inComparison)}
          gaps={gaps}
          onDesignate={(id, next) => updateCandidate(id, { isDesignatedSuccessor: next })}
          onClose={() => setComparisonOpen(false)}
        />
      )}
    </div>
  )
}

function GapBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded border border-slate-200 px-1.5 py-1 text-center">
      <p className="text-[7px] font-bold uppercase text-slate-400">{label}</p>
      <p className={`text-sm font-extrabold ${color}`}>{value}</p>
    </div>
  )
}
