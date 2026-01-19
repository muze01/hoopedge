"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/actions/auth-actions";

export default function ResetPasswordClient() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await resetPassword(
        password,
        token,
      );
      
      // Redirect to auth page with success message
      router.push("/auth?message=password-reset-success");
    } catch (err) {
      setError(
        `Error resetting password: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

 return (
   <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
     <div className="flex items-center justify-center px-4 pt-24 pb-12">
       <div className="w-full max-w-md">
         <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
           {/* Header */}
           <div className="text-center">
             <h1 className="text-2xl font-bold text-gray-900 mb-2">
               Reset your password
             </h1>
             <p className="text-sm text-gray-600">
               Choose a new password for your account.
             </p>
           </div>

           {/* Error Display */}
           {error && (
             <div className="rounded-lg border border-red-200 bg-red-50 p-4">
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

           {/* Password Reset Form */}
           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label
                 htmlFor="password"
                 className="block text-sm font-medium text-gray-700 mb-1"
               >
                 New password
               </label>
               <input
                 id="password"
                 type="password"
                 autoComplete="new-password"
                 required
                 minLength={8}
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 disabled={isLoading}
                 placeholder="Enter a new password"
                 className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
               />
             </div>

             <div>
               <label
                 htmlFor="confirmPassword"
                 className="block text-sm font-medium text-gray-700 mb-1"
               >
                 Confirm password
               </label>
               <input
                 id="confirmPassword"
                 type="password"
                 autoComplete="new-password"
                 required
                 minLength={8}
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 disabled={isLoading}
                 placeholder="Confirm new password"
                 className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
               />
             </div>

             <button
               type="submit"
               disabled={isLoading}
               className="w-full flex items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isLoading ? (
                 <div className="flex items-center">
                   <svg
                     className="animate-spin mr-2 h-5 w-5 text-white"
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
                     />
                     <path
                       className="opacity-75"
                       fill="currentColor"
                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                     />
                   </svg>
                   Resetting…
                 </div>
               ) : (
                 "Reset password"
               )}
             </button>
           </form>
         </div>
       </div>
     </div>
   </div>
 );

}