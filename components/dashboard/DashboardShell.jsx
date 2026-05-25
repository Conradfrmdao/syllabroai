import DashboardSidebar from "./DashboardSideBar";
import DashboardTopbar from "./DashboardTopbar";

export default function DashboardShell({ children }) {
    return(
        <div className="flex min-h-screen">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col">
                <DashboardTopbar />
                <main className="flex-1 p-8">{children}</main>
            </div>
        </div>
    )
}