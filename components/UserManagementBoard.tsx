'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import UserFormModal from './UserFormModal'

export type ItmsUser = {
  id: string
  nip: string
  email: string
  fullName: string
  role: string
  jobPosition: string | null
  department: string | null
  createdAt: string
}

const ROLE_LABEL: Record<string, string> = {
  SUPERADMIN: 'Superadmin',
  ADMIN: 'Admin',
  MANAJEMEN: 'Manajemen',
  MANAGER: 'Manager',
  PEKERJA: 'Pekerja',
  ADMIN_STRUKTUR: 'Admin Struktur',
  ADMIN_ANAK: 'Admin Anak Perusahaan',
}

export default function UserManagementBoard() {
  const [users, setUsers] = useState<ItmsUser[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ItmsUser | null>(null)

  async function loadData() {
    setLoading(true)
    const res = await fetch('/api/users')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Hapus user ini? Tindakan ini tidak bisa dibatalkan.')) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Gagal menghapus user')
      return
    }
    loadData()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingUser(null)
            setModalOpen(true)
          }}
          className="flex items-center gap-1.5 rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Plus size={16} /> Tambah User
        </button>
      </div>

      <div className="overflow-hidden rounded border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-slate-400">Memuat data...</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">Belum ada user.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase text-slate-400">
                <th className="px-4 py-3">NIP</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Jabatan</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 text-slate-700">
                  <td className="px-4 py-3">{u.nip}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{u.fullName}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {ROLE_LABEL[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{u.jobPosition || '-'}</td>
                  <td className="px-4 py-3">{u.department || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(u)
                          setModalOpen(true)
                        }}
                        className="rounded border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-50"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="rounded border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                        aria-label="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}
