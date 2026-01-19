import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import ResetPasswordClient from './reset-password-client';

export default async function ResetPasswordPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session) {
    redirect("/dashboard");
  }

  return <ResetPasswordClient />;
}