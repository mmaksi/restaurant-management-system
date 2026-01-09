import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <div className="min-h-svh w-full flex flex-col">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Restaurant Management System
          </h1>
          <p className="text-slate-600 mt-1">Account created successfully</p>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <Card className="bg-white shadow-xl rounded-xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Thank you for signing up!
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Check your email to confirm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-6">
                  You&apos;ve successfully signed up. Please check your email to
                  confirm your account before signing in.
                </p>
                <Link href="/auth/login">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                    Go to Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
