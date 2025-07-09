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
    fullText: "Rock Paper Scissors Lizard Spock",
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
    <nav className="fixed top-0 w-full bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/50 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 text-gray-100 hover:text-white transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaGamepad className="w-7 h-7 text-emerald-500 group-hover:text-emerald-400 transition-colors duration-300" />
            <span className="font-bold text-xl tracking-tight">
              Game Hub
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinksData.map((item) => {
              const to = item.type === "ONLINE" && item.slug
                ? `/games/${item.slug}`
                : item.to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "text-emerald-400 bg-gray-800/80 font-semibold shadow-lg shadow-emerald-500/10"
                        : "text-gray-300 hover:text-emerald-400 hover:bg-gray-800/50"
                    }`
                  }
                >
                  {item.fullText ? (
                    <>
                      <span className="hidden lg:inline">{item.fullText}</span>
                      <span className="lg:hidden">{item.text}</span>
                    </>
                  ) : (
                    item.text
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={`
          md:hidden fixed inset-x-0 top-16 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50
          transition-all duration-300 ease-in-out transform
          ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">
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
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                      : "text-gray-200 hover:bg-gray-800/50 hover:text-emerald-400"
                  }`
                }
              >
                <item.IconComponent className="w-5 h-5 opacity-90" />
                <span>{item.fullText || item.text}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
