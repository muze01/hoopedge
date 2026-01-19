"use client";

import { auth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Session = typeof auth.$Infer.Session;

export default function Navigation({ session }: { session: Session | null }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
              {/* Basketball icon */}
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white"
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

          {/* Nav */}
          <nav className="flex items-center gap-6">
            <NavLink href="/" active={isActive("/")}>
              Home
            </NavLink>

            {session ? (
              <NavLink href="/analytics" active={isActive("/analytics")}>
                Analytics
              </NavLink>
            ) : (
              ""
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
        </div>
      </div>
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
