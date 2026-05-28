import DashboardSidebar from "./DashboardSideBar";
import DashboardTopbar from "./DashboardTopbar";

export default function DashboardShell({ children }) {
  return (
    <div className="app-shell-bg relative min-h-screen overflow-x-hidden">
      <div className="hero-orb animate-pulse-soft left-[-8rem] top-[-6rem] h-72 w-72 bg-sky-500/10" />
      <div className="hero-orb animate-float-delayed right-[-8rem] top-20 h-80 w-80 bg-white/6" />
      <div className="pointer-events-none fixed inset-y-0 left-0 hidden w-[46rem] bg-linear-to-r from-slate-900/70 via-sky-950/18 to-transparent lg:block" />

      <div className="relative min-h-screen lg:pl-72">
        <DashboardSidebar />

        <div className="relative flex min-h-screen flex-1 flex-col">
          <DashboardTopbar />

          <main className="flex-1 px-4 pb-6 pt-2 sm:px-6 lg:px-8 lg:pb-8">
            <div className="w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
