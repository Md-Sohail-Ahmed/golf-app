import { Bell, HeartHandshake, LayoutDashboard, LogOut, Shield, Trophy } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

const baseNav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/subscription", label: "Subscription", icon: HeartHandshake },
  { to: "/dashboard/scores", label: "Scores", icon: Trophy },
  { to: "/dashboard/winnings", label: "Winnings", icon: Trophy },
  { to: "/dashboard/notifications", label: "Alerts", icon: Bell }
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navItems =
    user?.role === "admin"
      ? [...baseNav, { to: "/dashboard/admin", label: "Admin", icon: Shield }]
      : baseNav;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.32),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#edf6ff_42%,#e0f2fe_100%)] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px,1fr]">
        <aside className="rounded-3xl border border-sky-100 bg-white/85 p-6 backdrop-blur">
          <Link to="/dashboard" className="mb-8 block">
            <p className="text-xs uppercase tracking-[0.4em] text-sky-500">Golf Give Back</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Play. Win. Give.</h1>
          </Link>
          <div className="mb-6 rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <p className="text-sm text-slate-800">{user?.full_name || user?.fullName}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{user?.role}</p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/dashboard"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                      isActive
                        ? "bg-sky-500 text-white shadow-[0_12px_30px_rgba(14,165,233,0.28)]"
                        : "text-slate-600 hover:bg-sky-50"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={logout}
            className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-sky-100 px-4 py-3 text-slate-700 transition hover:bg-sky-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>
        <main className="space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
