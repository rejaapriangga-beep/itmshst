'use client'

import { useEffect, useState, useMemo } from 'react'
import { Star, User, Users, Plus } from 'lucide-react'
import AddJobTargetModal from './AddJobTargetModal'
import SuccessionModal from './SuccessionModal'

export type Position = {
  id: string
  positionCode: string
  positionName: string
  unit: string | null
  tipeJabatan: string | null
  holderNames: string | null
  jumlahSlot: number
  filledCount: number
  isVacant: boolean
  isCritical: boolean
  criticalityReason: string | null
  tugasPokokFungsi: string | null
  successorCount: number
  formalSuccessorCount: number
}

export default function JobTargetBoard() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'kritikal' | 'semua'>('kritikal')
  const [search, setSearch] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [activePositionId, setActivePositionId] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    const res = await fetch('/api/succession-positions')
    if (res.ok) setPositions(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function toggleCritical(id: string, next: boolean) {
    setPositions((prev) => prev.map((p) => (p.id === id ? { ...p, isCritical: next } : p)))
    await fetch(`/api/succession-positions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCritical: next }),
    })
  }

  const stats = useMemo(() => {
    const total = positions.length
    const critical = positions.filter((p) => p.isCritical).length
    const vacant = positions.filter((p) => p.isVacant).length
    const jobTargetVacant = positions.filter((p) => p.isCritical && p.isVacant).length
    return { total, critical, vacant, jobTargetVacant }
  }, [positions])

  const filtered = useMemo(() => {
    let list = positions
    if (filter === 'kritikal') list = list.filter((p) => p.isCritical)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.positionName.toLowerCase().includes(q) ||
          (p.unit || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [positions, filter, search])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Cari nama jabatan atau unit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[240px] flex-1 rounded border border-slate-300 px-3 py-2 text-sm text-slate-800"
        />
        <div className="flex overflow-hidden rounded border border-slate-300">
          <button
            onClick={() => setFilter('kritikal')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium ${
              filter === 'kritikal' ? 'bg-[#0F2A4A] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Star size={14} /> Job Target (Kritikal)
          </button>
          <button
            onClick={() => setFilter('semua')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'semua' ? 'bg-[#0F2A4A] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Semua Posisi
          </button>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded bg-[#E85D1A] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus size={16} /> Tandai Posisi Kritikal
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Posisi" value={stats.total} accent="text-[#0F2A4A]" />
        <StatCard label="Ditandai Kritikal" value={stats.critical} accent="text-[#E85D1A]" />
        <StatCard label="Posisi Vacant" value={stats.vacant} accent="text-red-600" />
        <StatCard label="Job Target Vacant" value={stats.jobTargetVacant} accent="text-red-600" />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Memuat data...</p>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded border border-slate-200 bg-white text-sm text-slate-400">
          {filter === 'kritikal' ? 'Belum ada posisi yang ditandai kritikal.' : 'Tidak ada data.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PositionCard
              key={p.id}
              position={p}
              onToggleCritical={toggleCritical}
              onOpenPlan={() => setActivePositionId(p.id)}
            />
          ))}
        </div>
      )}

      {addModalOpen && (
        <AddJobTargetModal
          onClose={() => setAddModalOpen(false)}
          onSaved={() => {
            setAddModalOpen(false)
            loadData()
          }}
        />
      )}

      {activePositionId && (
        <SuccessionModal
          positionId={activePositionId}
          position={positions.find((p) => p.id === activePositionId)!}
          onClose={() => setActivePositionId(null)}
          onCandidatesChanged={loadData}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}

function PositionCard({
  position: p,
  onToggleCritical,
  onOpenPlan,
}: {
  position: Position
  onToggleCritical: (id: string, next: boolean) => void
  onOpenPlan: () => void
}) {
  return (
    <div className="flex flex-col rounded border border-slate-200 bg-white p-4">
      <span
        className={`mb-2 inline-block w-fit rounded px-2 py-0.5 text-[11px] font-semibold ${
          p.isVacant ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
        }`}
      >
        {p.isVacant ? 'VACANT' : 'FILLED'}
      </span>

      <h3 className="text-sm font-bold text-slate-800">{p.positionName}</h3>
      {p.unit && <p className="mt-0.5 text-xs text-slate-500">{p.unit}</p>}

      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-700">
        <User size={13} /> {p.holderNames || '—'}
      </div>

      <div className="mt-2 space-y-1 text-xs text-slate-500">
        <p>Slot: <span className="font-medium text-slate-700">{p.filledCount}/{p.jumlahSlot}</span></p>
        <p>Tipe: <span className="font-medium text-slate-700">{p.tipeJabatan || '-'}</span></p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.isCritical && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
            ⭐ Job Target{p.criticalityReason ? ` — ${p.criticalityReason}` : ''}
          </span>
        )}
        {p.successorCount > 0 && (
          <button
            onClick={onOpenPlan}
            className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100"
          >
            <Users size={11} /> Memiliki {p.successorCount} Suksesor
            {p.formalSuccessorCount > 0 ? ` · ★ ${p.formalSuccessorCount} Resmi` : ''}
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onToggleCritical(p.id, !p.isCritical)}
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          {p.isCritical ? 'Batal Kritikal' : '⭐ Tandai Kritikal'}
        </button>
        {p.isCritical && (
          <button
            onClick={onOpenPlan}
            className="flex-1 rounded bg-[#0F2A4A] px-3 py-2 text-xs font-medium text-white hover:opacity-90"
          >
            📋 Succession Plan
          </button>
        )}
      </div>
    </div>
  )
}
