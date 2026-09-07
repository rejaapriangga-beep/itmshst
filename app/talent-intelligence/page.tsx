import DashboardShell from '@/components/DashboardShell'
import TalentIntelligenceDashboard from '@/components/TalentIntelligenceDashboard'

export default function TalentIntelligencePage() {
  return (
    <DashboardShell breadcrumb="Talent Intelligence" title="Talent Intelligence">
      <TalentIntelligenceDashboard />
    </DashboardShell>
  )
}
