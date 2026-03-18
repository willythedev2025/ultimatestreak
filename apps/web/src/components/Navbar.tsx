"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { authApiFetch } from "@/lib/api";

interface ContestEntry {
  id: string;
  contest_id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
}

interface Contest {
  id: string;
  month: number;
  year: number;
  status: string;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pick", label: "Pick" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function Navbar() {
  const { user, session, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [streak, setStreak] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.access_token) return;

    async function fetchStreak() {
      try {
        const contest = await authApiFetch<Contest>(
          "/api/contests/current",
          session!.access_token
        );
        const entry = await authApiFetch<ContestEntry>(
          `/api/contests/${contest.id}/entry`,
          session!.access_token
        );
        setStreak(entry.current_streak);
      } catch {
        setStreak(null);
      }
    }

    fetchStreak();
  }, [session]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-nav">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo + links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black text-sm group-hover:bg-brand-700 transition">
              US
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block">
              Ultimate Streak
            </span>
          </Link>

          {!loading && user && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    pathname === link.href
                      ? "bg-surface-2 text-gray-900 font-semibold"
                      : "text-gray-500 hover:text-gray-900 hover:bg-surface-1"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {!loading && !user && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/leaderboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  pathname === "/leaderboard"
                    ? "bg-surface-2 text-gray-900 font-semibold"
                    : "text-gray-500 hover:text-gray-900 hover:bg-surface-1"
                }`}
              >
                Leaderboard
              </Link>
            </div>
          )}
        </div>

        {/* Right: streak + user menu */}
        <div className="flex items-center gap-3">
          {!loading && user && streak !== null && (
            <div className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-full px-3 py-1.5">
              <span className="text-sm">
                {streak > 0 ? "\u{1F525}" : "\u{1F9CA}"}
              </span>
              <span className="font-bold text-sm text-gray-900">{streak}</span>
              <span className="text-xs text-gray-400 hidden sm:inline">
                streak
              </span>
            </div>
          )}

          {!loading && user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition rounded-lg px-2 py-1.5 hover:bg-surface-2"
              >
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-xs uppercase">
                  {displayName.charAt(0)}
                </div>
                <span className="hidden sm:inline font-medium text-gray-700">
                  {displayName}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-border rounded-xl shadow-lg py-1.5">
                  <div className="md:hidden px-2 py-1 border-b border-border mb-1">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-surface-2 rounded-lg transition"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-surface-2 transition"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {!loading && !user && (
            <Link href="/login" className="btn-primary text-sm py-2">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
