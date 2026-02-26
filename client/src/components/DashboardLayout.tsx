import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * DashboardLayout Component
 * Design: Clean, functional dashboard with sidebar navigation
 * - Collapsible sidebar for better space management
 * - Header with user info and settings
 * - Professional color scheme (blue/gray)
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/search", label: "Buscar", icon: "🔍" },
    { href: "/favorites", label: "Favoritos", icon: "⭐" },
    { href: "/history", label: "Histórico", icon: "📋" },
  ];

  const isActive = (href: string) => location === href;

  const handleLogout = async () => {
    await logout();
    window.location.href = getLoginUrl();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://private-us-east-1.manuscdn.com/sessionFile/8n3CekvAHkJ3an3EiYMtMw/sandbox/SWsH9DDTAP3jy0epZ7YvYh_1772137195159_na1fn_bGVnYWxpeC1sb2dvLXRyYW5zcGFyZW50.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvOG4zQ2VrdkFIa0ozYW4zRWlZTXRNdy9zYW5kYm94L1NXc0g5RERUQVAzankwZXBaN1l2WWhfMTc3MjEzNzE5NTE1OV9uYTFmbl9iR1ZuWVd4cGVDMXNiMmR2TFhSeVlXNXpjR0Z5Wlc1MC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=dmA4DseW~rX1kYVMaty0BUsNzY98MLtQEEEsW2LDSPOlwPEILXDx0eBtDSQQsaQJ14flG9cIoQQsvwu4BBBDx71~wuMp5ngO4v1F32U3iPmpkCgiJzfhE-6lhABu0CXzhCYG-IxmAAI081tUW-OPTj9oMEqxg4F1eBqbBXDNZXr-TZWaBeS7bIS7bt-386uJP-LPPCDriqyq3NGXSj3BoRYLuH5gGxpNykinsCJjA6V2iXbqgP2mlhQ5a5qd0O0cGg2zgBSM6MxGGUwm8COsBI~xRM2IBxxCEYOyH7ttxJNQSCKStOxKkalCWaio3t1qL~pWSLwqyUQjcNxAr6GyPQ__"
              alt="LEGALIX"
              className="w-8 h-8"
            />
            {sidebarOpen && <span className="font-bold text-sm">LEGALIX</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => setLocation(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <div className="w-5 h-5 flex-shrink-0">{item.icon}</div>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Monitoramento DOU
            </h1>
            <p className="text-sm text-gray-600">
              Acompanhe publicações em tempo real
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
