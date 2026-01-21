"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-20 mb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              HoopEdge
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Basketball analytics focused on finding real edges — starting with
              half-time performance, odds behavior, and team tendencies.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/analytics"
                  className="text-gray-600 hover:text-gray-900 transition cursor-pointer"
                >
                  HT Analytics
                </Link>
              </li>
              <li className="text-gray-400">
                FT Analysis <span className="text-xs">(coming soon)</span>
              </li>
              <li className="text-gray-400">
                Quarter Analysis <span className="text-xs">(coming soon)</span>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 transition cursor-pointer"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/auth"
                  className="text-gray-600 hover:text-gray-900 transition cursor-pointer"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Meta */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">Terms of Service</li>
              <li className="text-gray-400">Privacy Policy</li>
              <li className="text-gray-400">Responsible Use</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} HoopEdge. All rights reserved.
          </p>

          <p className="text-xs text-gray-400">
            Built for serious basketball analysis
          </p>
        </div>
      </div>
    </footer>
  );
}
