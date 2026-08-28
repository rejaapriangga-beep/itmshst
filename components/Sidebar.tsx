'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Users,
  Briefcase,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

type SubItem = {
  label: string
  href: string
  badge?: boolean
}

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  children?: SubItem[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutGrid,
  },
  {
    label: 'Talent Pool',
    href: '/talent-pool',
    icon: Users,
    children: [
      { label: 'Master Data Talent', href: '/talent-pool/master-data' },
      { label: 'Manage Data Talent', href: '/talent-pool/manage-data' },
      { label: 'Nominated Data Talent', href: '/talent-pool/nominated', badge: true },
      { label: 'History Demote', href: '/talent-pool/history-demote' },
    ],
  },
  {
    label: 'Succession Planning',
    href: '/succession-planning',
    icon: Briefcase,
    children: [
      { label: 'Job Target', href: '/succession-planning/job-target' },
      { label: 'List of Talent Target', href: '/succession-planning/list-talent-target' },
    ],
  },
  {
    label: 'General Setting',
    href: '/settings',
    icon: Settings,
    children: [
      { label: 'Talent Readiness', href: '/settings/talent-readiness' },
      { label: 'User Management', href: '/settings/users' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname === href
  }

  function toggleMenu(label: string) {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  return (
    <aside
      className={`flex h-screen flex-col bg-[#1e3a6e] text-white transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-xl font-bold italic tracking-tight">
              iTMS <span className="text-xs font-medium not-italic text-white/60">by KAI</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          const hasChildren = !!item.children?.length
          const isOpen = openMenus.includes(item.label)

          return (
            <div key={item.label}>
              {hasChildren ? (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`mx-2 my-0.5 flex w-[calc(100%-1rem)] items-center justify-between rounded px-3 py-2.5 text-sm font-medium ${
                    active ? 'bg-white/15 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </span>
                  {!collapsed && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`mx-2 my-0.5 flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium ${
                    active ? 'bg-white/15 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )}

              {!collapsed && hasChildren && isOpen && (
                <div className="mx-2 mb-1 flex flex-col overflow-hidden rounded bg-white/10">
                  {item.children!.map((sub) => {
                    const subActive = pathname === sub.href
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`flex items-center justify-between px-4 py-2.5 text-[13px] ${
                          subActive
                            ? 'bg-[#0f2a56] font-semibold text-white'
                            : 'text-white/75 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{sub.label}</span>
                        {sub.badge && (
                          <span className="h-2 w-2 rounded-full border border-white/70" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
