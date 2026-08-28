import DashboardShell from '@/components/DashboardShell'
import UserManagementBoard from '@/components/UserManagementBoard'

export default function UserManagementPage() {
  return (
    <DashboardShell breadcrumb="General Setting / User Management" title="User Management">
      <UserManagementBoard />
    </DashboardShell>
  )
}
