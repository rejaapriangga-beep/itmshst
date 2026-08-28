import DashboardShell from '@/components/DashboardShell'

export default async function JobTargetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await params
  return (
    <DashboardShell breadcrumb="Succession Planning / Job Target / Detail" title="Succession Plan">
      <div className="flex h-64 items-center justify-center rounded border border-slate-200 bg-white text-sm text-slate-400">
        Detail kandidat & job fit scoring akan dibangun di tahap berikutnya.
      </div>
    </DashboardShell>
  )
}
