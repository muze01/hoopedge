import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import VerifyEmailClient from './verify-email-client';

export default async function VerifyEmailPage() {
    const session = await auth.api.getSession({
    headers: await headers()
    });

    // If already verified, redirect to dashboard
    if (session?.user?.emailVerified) {
        redirect("/dashboard");
    }

  // Pass user email if they're logged in but not verified...Happens after new user signup..so we auto send a mail so they verify
    return <VerifyEmailClient userEmail={session?.user?.email} />;
}