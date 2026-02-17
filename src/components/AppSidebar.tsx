import { LayoutDashboard, MessageSquare, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Board", url: "/", icon: LayoutDashboard },
  { title: "AI Chat", url: "/chat", icon: MessageSquare },
];

export function AppSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <aside className="w-16 hover:w-52 transition-all duration-300 group bg-sidebar flex flex-col items-center py-6 gap-2 shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-sidebar-active flex items-center justify-center mb-6">
        <span className="text-sidebar-active-foreground font-bold text-lg">K</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 w-full px-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                isActive
                  ? "bg-sidebar-active text-sidebar-active-foreground shadow-lg shadow-sidebar-active/25"
                  : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-active-foreground"
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {item.title}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-active-foreground transition-all w-full mx-2 text-sm"
      >
        <LogOut className="w-5 h-5 shrink-0" />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Sign Out
        </span>
      </button>
    </aside>
  );
}
