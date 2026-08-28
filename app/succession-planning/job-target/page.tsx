import DashboardShell from '@/components/DashboardShell'
import JobTargetBoard from '@/components/JobTargetBoard'

export default function JobTargetPage() {
  return (
    <DashboardShell breadcrumb="Succession Planning / Job Target" title="Job Target">
      <JobTargetBoard />
    </DashboardShell>
  )
}
