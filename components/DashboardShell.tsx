'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Bell, Settings, LogOut, User } from 'lucide-react'
import Sidebar from './Sidebar'

type Props = {
  breadcrumb: string
  title: string
  children?: React.ReactNode
}

export default function DashboardShell({ breadcrumb, title, children }: Props) {
  const { data: session } = useSession()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <span className="text-lg font-bold text-slate-800">ITMS</span>

          <div className="flex items-center gap-3">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label="Notifikasi"
            >
              <Bell size={16} />
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label="Pengaturan"
            >
              <Settings size={16} />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300"
                aria-label="Profil"
              >
                <User size={16} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-sm font-medium text-slate-800">
                      {session?.user?.name || 'Pengguna'}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {session?.user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={14} />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Breadcrumb + title */}
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <p className="text-sm text-blue-700">{breadcrumb}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">{title}</h1>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-400">
          Copyright © {new Date().getFullYear()} ITMS KAI GROUP
        </footer>
      </div>
    </div>
  )
}
