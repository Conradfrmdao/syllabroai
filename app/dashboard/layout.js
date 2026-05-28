import DashboardShell from '@/components/dashboard/DashboardShell';

export default function DashboardLayout({ children }) {
  return(
    <div className='flex min-h-screen w-full' >

        <DashboardShell>{children}</DashboardShell>
  
    </div>
  )
}
