'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { ItmsUser } from './UserManagementBoard'

const ROLES = [
  { value: 'SUPERADMIN', label: 'Superadmin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAJEMEN', label: 'Manajemen' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'PEKERJA', label: 'Pekerja' },
  { value: 'ADMIN_STRUKTUR', label: 'Admin Struktur' },
  { value: 'ADMIN_ANAK', label: 'Admin Anak Perusahaan' },
]

export default function UserFormModal({
  user,
  onClose,
  onSaved,
}: {
  user: ItmsUser | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!user

  const [form, setForm] = useState({
    nip: user?.nip || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
    role: user?.role || 'PEKERJA',
    jobPosition: user?.jobPosition || '',
    department: user?.department || '',
    password: '',
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

    const url = isEdit ? `/api/users/${user!.id}` : '/api/users'
    const method = isEdit ? 'PATCH' : 'POST'
    const body = isEdit
      ? {
          fullName: form.fullName,
          role: form.role,
          jobPosition: form.jobPosition,
          department: form.department,
          ...(form.password ? { password: form.password } : {}),
        }
      : form

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-sm font-bold text-slate-800">{isEdit ? 'Edit User' : 'Tambah User'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4">
          {error && <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <Field label="NIP *">
              <input
                required
                disabled={isEdit}
                value={form.nip}
                onChange={(e) => update('nip', e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </Field>
            <Field label="Email *">
              <input
                required
                type="email"
                disabled={isEdit}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </Field>
          </div>

          <Field label="Nama Lengkap *">
            <input
              required
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800"
            />
          </Field>

          <Field label="Role *">
            <select
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Jabatan">
              <input
                value={form.jobPosition}
                onChange={(e) => update('jobPosition', e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800"
              />
            </Field>
            <Field label="Unit / Departemen">
              <input
                value={form.department}
                onChange={(e) => update('department', e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800"
              />
            </Field>
          </div>

          <Field label={isEdit ? 'Reset Password (opsional)' : 'Password *'}>
            <input
              required={!isEdit}
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder={isEdit ? 'Kosongkan jika tidak diubah' : ''}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800"
            />
          </Field>

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
