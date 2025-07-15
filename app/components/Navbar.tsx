// app/components/Navbar.tsx
import { Link, NavLink } from "@remix-run/react";
import { useState } from "react";
import {
  FaGamepad,
  FaBars,
  FaTimes,
  FaHome,
  FaHandRock,
  FaBolt,
  FaDice,
  FaCoins,
} from "react-icons/fa";
import { Fish } from "lucide-react";
import { Sparkles } from "lucide-react";

interface NavLinkItem {
  to: string;
  text: string;
  fullText?: string;
  IconComponent: React.ComponentType<{ className?: string }>;
  type?: "LOCAL" | "ONLINE";
  slug?: string;
}

const navLinksData: NavLinkItem[] = [
  { to: "/", text: "Home", IconComponent: FaHome, type: "LOCAL" },
  {
    to: "/rock-paper-scissors-lizard-spock",
    text: "RPSLS",
    fullText: "RPSLS",
    IconComponent: FaHandRock,
    type: "LOCAL",
  },
  {
    to: "/reaction-test",
    text: "Reaction Test",
    IconComponent: FaBolt,
    type: "LOCAL",
  },
  {
    to: "",
    text: "Fishing",
    IconComponent: Fish,
    type: "ONLINE",
    slug: "fishing",
  },
  {
    to: "",
    text: "Kniffel",
    IconComponent: FaDice,
    type: "ONLINE",
    slug: "kniffel",
  },
  {
    to: "",
    text: "Nim",
    IconComponent: FaCoins,
    type: "ONLINE",
    slug: "nim",
  },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-white/10 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3 text-white hover:text-white/90 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
              <FaGamepad className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                GameHub
              </span>
              <div className="flex items-center gap-1">
                <Sparkles size={12} className="text-purple-400" />
                <span className="text-xs text-gray-400 font-medium">Beta</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinksData.map((item) => {
              const to = item.type === "ONLINE" && item.slug
                ? `/games/${item.slug}`
                : item.to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `group relative px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "text-white bg-white/10 border border-white/20 shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
                    }`
                  }
                >
                  <div className="flex items-center gap-2">
                    <item.IconComponent className={`w-4 h-4 transition-colors duration-300 ${
                      ({ isActive }: { isActive: boolean }) => isActive ? "text-purple-400" : "text-gray-400 group-hover:text-purple-400"
                    }`} />
                    <span>{item.fullText || item.text}</span>
                  </div>
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </NavLink>
              );
            })}
          </div>

          {/* Tablet Nav */}
          <div className="hidden md:flex lg:hidden items-center gap-1">
            {navLinksData.map((item) => {
              const to = item.type === "ONLINE" && item.slug
                ? `/games/${item.slug}`
                : item.to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `group relative px-2 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                      isActive
                        ? "text-white bg-white/10 border border-white/20 shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
                    }`
                  }
                >
                  <div className="flex items-center gap-1">
                    <item.IconComponent className={`w-3 h-3 transition-colors duration-300 ${
                      ({ isActive }: { isActive: boolean }) => isActive ? "text-purple-400" : "text-gray-400 group-hover:text-purple-400"
                    }`} />
                    <span>{item.text}</span>
                  </div>
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </NavLink>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-5 h-5" />
            ) : (
              <FaBars className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={`
          lg:hidden fixed inset-x-0 top-16 bg-black/95 backdrop-blur-xl border-t border-white/10
          transition-all duration-300 ease-in-out transform
          ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
          {navLinksData.map((item) => {
            const to = item.type === "ONLINE" && item.slug
              ? `/games/${item.slug}`
              : item.to;
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 border ${
                    isActive
                      ? "bg-white/10 text-white border-white/20 shadow-lg"
                      : "text-gray-300 hover:bg-white/5 hover:text-white border-transparent hover:border-white/10"
                  }`
                }
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  ({ isActive }: { isActive: boolean }) => isActive 
                    ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg" 
                    : "bg-white/5 group-hover:bg-white/10"
                }`}>
                  <item.IconComponent className={`w-4 h-4 ${
                    ({ isActive }: { isActive: boolean }) => isActive ? "text-white" : "text-gray-400 group-hover:text-purple-400"
                  }`} />
                </div>
                <span>{item.fullText || item.text}</span>
                {item.type === "ONLINE" && (
                  <span className="ml-auto px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                    Online
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
