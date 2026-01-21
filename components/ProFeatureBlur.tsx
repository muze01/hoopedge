import React from "react";
import { Lock } from "lucide-react";
import Link from "next/link";

interface ProFeatureBlurProps {
  children: React.ReactNode;
  isBlurred?: boolean;
  featureName?: string;
  className?: string;
}

export const ProFeatureBlur: React.FC<ProFeatureBlurProps> = ({
  children,
  isBlurred = true,
  featureName = "this feature",
  className = "",
}) => {
  if (!isBlurred) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className} `}>
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none">{children}</div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/60 to-white/90 flex items-center justify-center">
        <div className="bg-white border-2 border-blue-500 rounded-xl shadow-2xl p-6 sm:p-8 max-w-md mx-4 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Pro Feature
          </h3>

          <p className="text-gray-600 mb-6">
            Upgrade to Pro to unlock {featureName} and get full access to all
            analytics features.
          </p>

          <Link
            href="/pricing"
            className="inline-block w-full px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Upgrade to Pro
          </Link>

          <p className="text-xs text-gray-500 mt-4">
            Get unlimited access to all features
          </p>
        </div>
      </div>
    </div>
  );
};
