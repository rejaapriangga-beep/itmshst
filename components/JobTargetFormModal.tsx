'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export default function JobTargetFormModal({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    positionCode: '',
    positionName: '',
    jobFamily: '',
    unit: '',
    grade: '',
    isVacant: false,
    isCritical: false,
    incumbentNip: '',
    incumbentName: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const res = await fetch('/api/succession-positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setSaving(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Gagal menyimpan data')
      return
    }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-sm font-bold text-slate-800">Tambah Posisi Job Target</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4">
          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          <Field label="Kode Jabatan *">
            <input
              required
              value={form.positionCode}
              onChange={(e) => update('positionCode', e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Nama Jabatan *">
            <input
              required
              value={form.positionName}
              onChange={(e) => update('positionName', e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Unit / Divisi">
            <input
              value={form.unit}
              onChange={(e) => update('unit', e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Contoh: Division of Building · PT KAI Pusat"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipe (Job Family)">
              <input
                value={form.jobFamily}
                onChange={(e) => update('jobFamily', e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="managerial / functional"
              />
            </Field>
            <Field label="Grade">
              <input
                value={form.grade}
                onChange={(e) => update('grade', e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="NIP Pemegang Jabatan">
              <input
                value={form.incumbentNip}
                onChange={(e) => update('incumbentNip', e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Nama Pemegang Jabatan">
              <input
                value={form.incumbentName}
                onChange={(e) => update('incumbentName', e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.isVacant}
                onChange={(e) => update('isVacant', e.target.checked)}
              />
              Posisi Vacant
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.isCritical}
                onChange={(e) => update('isCritical', e.target.checked)}
              />
              Tandai Kritikal (Job Target)
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  )
}
