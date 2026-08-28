import DashboardShell from '@/components/DashboardShell'

export default function DashboardPage() {
  return (
    <DashboardShell breadcrumb="Dashboard" title="Dashboard">
      <div className="flex h-64 items-center justify-center rounded border border-slate-200 bg-white text-sm text-slate-400">
        Belum ada data untuk ditampilkan.
      </div>
    </DashboardShell>
  )
}
