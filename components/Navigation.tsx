"use client";

import { auth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

type Session = typeof auth.$Infer.Session;

export default function Navigation({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3a15 15 0 010 18" />
                <path d="M12 3a15 15 0 000 18" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">HoopEdge</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink href="/" active={isActive("/")}>
              Home
            </NavLink>

            {session && (
              <NavLink href="/analytics" active={isActive("/analytics")}>
                Analytics
              </NavLink>
            )}

            {session ? (
              <Link
                href="/dashboard"
                className="ml-2 inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="space-y-2 px-4 py-4">
            <MobileLink href="/" onClick={() => setOpen(false)}>
              Home
            </MobileLink>

            {session && (
              <MobileLink href="/analytics" onClick={() => setOpen(false)}>
                Analytics
              </MobileLink>
            )}

            {session ? (
              <MobileLink href="/dashboard" onClick={() => setOpen(false)}>
                Dashboard
              </MobileLink>
            ) : (
              <MobileLink href="/auth" onClick={() => setOpen(false)}>
                Sign In
              </MobileLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition ${
        active ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}
