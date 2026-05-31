import DashboardSidebar from "./DashboardSideBar";
import DashboardTopbar from "./DashboardTopbar";
import MobileBottomNav from "./MobileBottomNav";

export default function DashboardShell({ children }) {
  return (
    <div className="app-shell-bg relative min-h-screen w-full flex-1 overflow-x-hidden">
      <div className="hero-orb animate-pulse-soft left-[-10rem] top-[-8rem] h-72 w-72 bg-sky-400/8" />
      <div className="hero-orb animate-float-delayed right-[-10rem] top-16 h-80 w-80 bg-white/5" />
      <div className="pointer-events-none fixed inset-y-0 left-0 hidden w-[42rem] bg-linear-to-r from-[#07111d]/82 via-[#081018]/36 to-transparent lg:block" />

      <div className="relative min-h-screen w-full lg:pl-72">
        <DashboardSidebar />

        <div className="relative flex min-h-screen w-full min-w-0 flex-col">
          <DashboardTopbar />

          <main className="w-full flex-1 px-4 pb-[calc(env(safe-area-inset-bottom)+7.75rem)] pt-3 sm:px-6 sm:pt-4 lg:px-8 lg:pb-8">
            <div className="w-full min-w-0">{children}</div>
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
