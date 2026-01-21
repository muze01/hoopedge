"use client";

import { signOut } from "@/lib/actions/auth-actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export default function DashboardClientPage({
  session,
}: {
  session: Session | null;
}) {
  const router = useRouter();
  const user = session?.user;

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Account overview & preferences
                </p>
              </div>

              {/* User Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <img
                    className="h-10 w-10 rounded-full border border-gray-200"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                    alt="User avatar"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {user?.name || "User"}
                    </p>
                    <p className="text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Account Status */}
            <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
              <h2 className="mb-4 text-sm font-semibold text-blue-900">
                Account Status
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Authenticated
                  </span>
                </div>

                <div>
                  <span className="text-gray-600">Email verified:</span>
                  <span className="ml-2 text-gray-900">
                    {user?.emailVerified ? "Yes" : "No"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-600">Account type:</span>
                  <span className="ml-2 text-gray-900">Free</span>
                </div>

                <div className="overflow-hidden">
                  <span className="text-gray-600">User ID:</span>
                  <span className="ml-2 block truncate text-gray-500">
                    {user?.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/analytics"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Open Analytics
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
