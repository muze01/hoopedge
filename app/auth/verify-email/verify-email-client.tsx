"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail, resendVerificationEmail } from "@/lib/actions/auth-actions";
import { VerifyEmailClientProps } from "@/types/all.types";

export default function VerifyEmailClient({ userEmail }: VerifyEmailClientProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [email, setEmail] = useState(userEmail || "");
  const [countdown, setCountdown] = useState(0);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (!token) return;

    const handleVerification = async () => {
      setIsVerifying(true);
      setError("");

      try {
        await verifyEmail(token);
        setSuccess(true);
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Verification failed: ${errorMessage}`);
      } finally {
        setIsVerifying(false);
      }
    };

    handleVerification();
  }, [token, router]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (countdown > 0) return;

    setIsResending(true);
    setResendSuccess(false);
    setError("");

    try {
      await resendVerificationEmail(email);
      setResendSuccess(true);
      
      // Set 60 second countdown
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Clear success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setError(
        `Failed to resend verification email: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsResending(false);
    }
  };

  // If currently verifying a token
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center p-4 pt-20">
          <div className="max-w-md w-full">
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
              <div className="flex justify-center mb-4">
                <svg
                  className="animate-spin h-10 w-10 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <p className="text-gray-700 text-base font-medium">
                Verifying your email…
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If verification succeeded
  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center p-4 pt-20">
          <div className="max-w-md w-full">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <svg
                  className="h-12 w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Email Verified!
              </h2>
              <p className="text-green-700">
                Your email has been successfully verified. Redirecting to dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main verification waiting page
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">We've sent a verification link to:</p>
            {email && (
              <p className="text-blue-600 font-semibold mt-2">{email}</p>
            )}
          </div>

          {/* Instructions Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="shrink-0 mt-0.5">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-semibold">
                      1
                    </span>
                  </div>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Check your email inbox (and spam folder)
                </p>
              </div>

              <div className="flex items-start">
                <div className="shrink-0 mt-0.5">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-semibold">
                      2
                    </span>
                  </div>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Click the verification link in the email
                </p>
              </div>

              <div className="flex items-start">
                <div className="shrink-0 mt-0.5">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-semibold">
                      3
                    </span>
                  </div>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  You'll be automatically redirected to your dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Resend Success Message */}
          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    Verification email sent successfully! Check your inbox.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Resend Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Didn't receive the email?
            </h3>
            <form onSubmit={handleResendVerification} className="space-y-4">
              {!userEmail && (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your email"
                    disabled={isResending}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isResending || countdown > 0}
                className="w-full flex justify-center items-center cursor-pointer py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend available in ${countdown}s`
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Resend Verification Email
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Back to Sign In */}
          <div className="text-center">
            <button
              onClick={() => router.push("/auth")}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}