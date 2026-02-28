import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Início", icon: "🏠" },
  { href: "/search", label: "Buscar", icon: "🔍" },
  { href: "/favorites", label: "Favoritos", icon: "⭐" },
  { href: "/history", label: "Histórico", icon: "📋" },
];

function NavContent({
  location,
  setLocation,
  isActive,
  onNavClick,
}: {
  location: string;
  setLocation: (path: string) => void;
  isActive: (href: string) => boolean;
  onNavClick?: () => void;
}) {
  const handleClick = (href: string) => {
    setLocation(href);
    onNavClick?.();
  };
  return (
    <nav className="flex-1 p-4 space-y-1" aria-label="Menu principal">
      {navItems.map((item) => (
        <button
          key={item.href}
          onClick={() => handleClick(item.href)}
          className={`w-full flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl transition-colors text-left text-base ${
            isActive(item.href)
              ? "bg-blue-600 text-white font-medium"
              : "text-gray-300 hover:bg-gray-800 active:bg-gray-700"
          }`}
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-lg">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();

  const isActive = (href: string) => location === href;

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          L
        </div>
        <span className="font-bold text-sm text-white">LEGALIX</span>
      </div>
      <NavContent
        location={location}
        setLocation={setLocation}
        isActive={isActive}
        onNavClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
      />
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar - hidden on mobile */}
      {!isMobile && (
        <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
          {sidebarContent}
        </aside>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 flex-shrink-0 min-h-[60px] sm:min-h-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
              LEGALIX
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              Diário Oficial da União
            </p>
          </div>
          {isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="flex-shrink-0 size-12 rounded-xl sm:size-10" aria-label="Abrir menu">
                  <Menu className="w-6 h-6 sm:w-5 sm:h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(85vw,320px)] p-0 bg-gray-900 border-gray-800 max-h-[100dvh] flex flex-col">
                <SheetHeader className="p-4 border-b border-gray-800 text-left shrink-0">
                  <SheetTitle className="text-white font-bold text-lg">Menu</SheetTitle>
                  <p className="text-gray-400 text-sm font-normal mt-0.5">Diário Oficial da União</p>
                </SheetHeader>
                <NavContent
                  location={location}
                  setLocation={setLocation}
                  isActive={isActive}
                  onNavClick={() => setMobileMenuOpen(false)}
                />
              </SheetContent>
            </Sheet>
          )}
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 pb-24 sm:pb-6">{children}</div>
        </main>

        {/* Bottom nav - mobile only */}
        {isMobile && (
          <nav
            className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around gap-1 bg-white border-t border-gray-200 px-2 py-2 safe-area-pb"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
            aria-label="Navegação principal"
          >
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <button
                  key={item.href}
                  onClick={() => setLocation(item.href)}
                  className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[64px] rounded-xl transition-colors ${
                    active ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-500 hover:bg-gray-100 active:bg-gray-200"
                  }`}
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
