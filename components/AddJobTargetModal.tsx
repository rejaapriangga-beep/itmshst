'use client'

import { useState } from 'react'
import { X, Search } from 'lucide-react'

type CareerPosition = {
  id: number
  nama_jabatan: string
  nama_unit: string
  perusahaan: string | null
  jumlah_slot: number
  tipe_jabatan: string
  filled_count: string
  holder_names: string | null
}

export default function AddJobTargetModal({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CareerPosition[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<CareerPosition | null>(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  let debounce: ReturnType<typeof setTimeout>

  function onQueryChange(value: string) {
    setQuery(value)
    clearTimeout(debounce)
    if (value.trim().length < 2) {
      setResults([])
      return
    }
    debounce = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/org-positions/search?q=${encodeURIComponent(value)}`)
      if (res.ok) setResults(await res.json())
      setSearching(false)
    }, 350)
  }

  async function handleSubmit() {
    if (!selected) return
    setSaving(true)
    setError('')
    const res = await fetch('/api/succession-positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ careerPositionId: selected.id, criticalityReason: reason || null }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Gagal menyimpan')
      return
    }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-sm font-bold text-slate-800">Tandai Posisi Kritikal (Job Target)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4">
          {error && <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

          {!selected ? (
            <>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Contoh: Manager, Direktur, Kepala Divisi..."
                  className="w-full rounded border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800"
                />
              </div>

              {searching && <p className="text-xs text-slate-400">Mencari...</p>}

              <div className="space-y-1">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="flex w-full flex-col rounded border border-slate-200 px-3 py-2 text-left text-sm hover:border-blue-400 hover:bg-blue-50"
                  >
                    <span className="font-medium text-slate-800">{r.nama_jabatan}</span>
                    <span className="text-xs text-slate-500">
                      {r.nama_unit}
                      {r.perusahaan ? ` · ${r.perusahaan}` : ''} — Slot {r.filled_count}/{r.jumlah_slot}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm">
                <p className="font-medium text-slate-800">{selected.nama_jabatan}</p>
                <p className="text-xs text-slate-500">{selected.nama_unit}</p>
                <button
                  onClick={() => setSelected(null)}
                  className="mt-1 text-xs font-medium text-blue-700 underline"
                >
                  Ganti posisi
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Alasan kritikal (opsional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  placeholder="Contoh: akan pensiun 2026, posisi strategis..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button onClick={onClose} className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selected || saving}
            className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Tandai Kritikal'}
          </button>
        </div>
      </div>
    </div>
  )
}
